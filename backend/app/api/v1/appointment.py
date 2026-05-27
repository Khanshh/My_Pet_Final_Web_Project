import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import admin_only
from app.models.appointment import AppointmentStatus
from app.schemas.appointment import (
    AppointmentCreateRequest,
    AppointmentUpdateStatusRequest,
    AppointmentResponse,
    AppointmentListResponse,
)
from app.services import appointment_service

router = APIRouter(prefix="/admin/appointments", tags=["Admin - Appointment Management"])


@router.get("", response_model=AppointmentListResponse, dependencies=[Depends(admin_only)])
async def get_appointments(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[AppointmentStatus] = None,
    owner_id: Optional[uuid.UUID] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Danh sách tất cả lịch hẹn kèm thông tin chi tiết"""
    return await appointment_service.list_appointments(db, page, limit, status, search, owner_id)


@router.get("/{appointment_id}", response_model=AppointmentResponse, dependencies=[Depends(admin_only)])
async def get_appointment(
    appointment_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Xem chi tiết một lịch hẹn"""
    return await appointment_service.get_appointment_by_id(db, appointment_id)


@router.post("", response_model=AppointmentResponse, dependencies=[Depends(admin_only)], status_code=201)
async def create_appointment(
    data: AppointmentCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Tạo lịch hẹn mới"""
    return await appointment_service.create_appointment(db, data)


@router.patch("/{appointment_id}/status", response_model=AppointmentResponse, dependencies=[Depends(admin_only)])
async def update_status(
    appointment_id: uuid.UUID,
    data: AppointmentUpdateStatusRequest,
    db: AsyncSession = Depends(get_db),
):
    """Cập nhật trạng thái lịch hẹn (pending → confirmed → completed | cancelled)"""
    return await appointment_service.update_appointment_status(db, appointment_id, data)


@router.delete("/{appointment_id}", dependencies=[Depends(admin_only)])
async def delete_appointment(
    appointment_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Xoá lịch hẹn"""
    return await appointment_service.delete_appointment(db, appointment_id)
