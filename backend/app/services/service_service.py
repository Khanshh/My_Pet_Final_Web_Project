import uuid
import math
from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.models.service import Service
from app.schemas.service import ServiceCreateRequest, ServiceUpdateRequest, ServiceListResponse


async def list_services(
    db: AsyncSession,
    page: int = 1,
    limit: int = 10,
    active_only: bool = False,
) -> ServiceListResponse:
    query = select(Service)
    count_query = select(func.count()).select_from(Service)

    if active_only:
        query = query.where(Service.is_active == True)
        count_query = count_query.where(Service.is_active == True)

    total = await db.scalar(count_query) or 0
    pages = math.ceil(total / limit) if total > 0 else 1

    result = await db.execute(
        query.order_by(Service.name)
        .offset((page - 1) * limit)
        .limit(limit)
    )
    items = result.scalars().all()

    return ServiceListResponse(
        items=items, total=total, page=page, limit=limit, pages=pages
    )


async def get_service_by_id(db: AsyncSession, service_id: uuid.UUID) -> Service:
    result = await db.execute(select(Service).where(Service.id == service_id))
    service = result.scalar_one_or_none()
    if not service:
        raise HTTPException(status_code=404, detail="Dịch vụ không tồn tại")
    return service


async def create_service(db: AsyncSession, data: ServiceCreateRequest) -> Service:
    service = Service(
        name=data.name,
        description=data.description,
        price=data.price,
        duration_minutes=data.duration_minutes,
        is_active=data.is_active,
    )
    db.add(service)
    await db.flush()
    await db.refresh(service)
    return service


async def update_service(
    db: AsyncSession, service_id: uuid.UUID, data: ServiceUpdateRequest
) -> Service:
    service = await get_service_by_id(db, service_id)
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(service, key, value)
    await db.flush()
    await db.refresh(service)
    return service


async def delete_service(db: AsyncSession, service_id: uuid.UUID) -> dict:
    service = await get_service_by_id(db, service_id)
    await db.delete(service)
    await db.flush()
    return {"detail": f"Đã xoá dịch vụ '{service.name}'"}
