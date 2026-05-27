import uuid
import math
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.models.appointment import Appointment, AppointmentStatus
from app.models.user import User
from app.models.pet import Pet
from app.models.veterinarian import Veterinarian
from app.models.service import Service
from app.schemas.appointment import (
    AppointmentCreateRequest,
    AppointmentUpdateStatusRequest,
    AppointmentListResponse,
)


def _base_query():
    return (
        select(Appointment)
        .options(
            joinedload(Appointment.owner),
            joinedload(Appointment.pet),
            joinedload(Appointment.vet),
            joinedload(Appointment.service),
        )
    )


async def list_appointments(
    db: AsyncSession,
    page: int = 1,
    limit: int = 10,
    status: Optional[AppointmentStatus] = None,
    search: Optional[str] = None,
    owner_id: Optional[uuid.UUID] = None,
) -> AppointmentListResponse:
    query = _base_query()
    count_query = select(func.count()).select_from(Appointment)

    if status:
        query = query.where(Appointment.status == status)
        count_query = count_query.where(Appointment.status == status)

    if owner_id:
        query = query.where(Appointment.owner_id == owner_id)
        count_query = count_query.where(Appointment.owner_id == owner_id)

    if search:
        # Tìm kiếm theo tên thú cưng hoặc tên chủ
        query = query.where(
            Appointment.pet.has(Pet.name.ilike(f"%{search}%"))
            | Appointment.owner.has(User.full_name.ilike(f"%{search}%"))
        )
        count_query = count_query.where(
            Appointment.pet_id.in_(
                select(Pet.id).where(Pet.name.ilike(f"%{search}%"))
            )
            | Appointment.owner_id.in_(
                select(User.id).where(User.full_name.ilike(f"%{search}%"))
            )
        )

    total = await db.scalar(count_query) or 0
    pages = math.ceil(total / limit) if total > 0 else 1

    result = await db.execute(
        query.order_by(Appointment.scheduled_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    items = result.scalars().unique().all()

    return AppointmentListResponse(
        items=items, total=total, page=page, limit=limit, pages=pages
    )


async def get_appointment_by_id(db: AsyncSession, appointment_id: uuid.UUID) -> Appointment:
    result = await db.execute(
        _base_query().where(Appointment.id == appointment_id)
    )
    appointment = result.scalars().unique().one_or_none()
    if not appointment:
        raise HTTPException(status_code=404, detail="Lịch hẹn không tồn tại")
    return appointment


async def create_appointment(
    db: AsyncSession, data: AppointmentCreateRequest
) -> Appointment:
    appointment = Appointment(
        owner_id=data.owner_id,
        pet_id=data.pet_id,
        vet_id=data.vet_id,
        service_id=data.service_id,
        scheduled_at=data.scheduled_at,
        notes=data.notes,
        status=AppointmentStatus.pending,
    )
    db.add(appointment)
    await db.flush()
    # Reload with relationships
    return await get_appointment_by_id(db, appointment.id)


async def update_appointment_status(
    db: AsyncSession,
    appointment_id: uuid.UUID,
    data: AppointmentUpdateStatusRequest,
) -> Appointment:
    result = await db.execute(
        select(Appointment).where(Appointment.id == appointment_id)
    )
    appointment = result.scalar_one_or_none()
    if not appointment:
        raise HTTPException(status_code=404, detail="Lịch hẹn không tồn tại")
    appointment.status = data.status
    await db.flush()
    return await get_appointment_by_id(db, appointment_id)


async def delete_appointment(db: AsyncSession, appointment_id: uuid.UUID) -> dict:
    result = await db.execute(
        select(Appointment).where(Appointment.id == appointment_id)
    )
    appointment = result.scalar_one_or_none()
    if not appointment:
        raise HTTPException(status_code=404, detail="Lịch hẹn không tồn tại")
    await db.delete(appointment)
    await db.flush()
    return {"detail": "Đã xoá lịch hẹn"}


async def get_appointments_by_owner(
    db: AsyncSession, owner_id: uuid.UUID
) -> list[Appointment]:
    result = await db.execute(
        _base_query()
        .where(Appointment.owner_id == owner_id)
        .order_by(Appointment.scheduled_at.desc())
    )
    return result.scalars().unique().all()
