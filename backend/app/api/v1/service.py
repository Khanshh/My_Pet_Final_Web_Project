import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import admin_only
from app.schemas.service import (
    ServiceCreateRequest,
    ServiceUpdateRequest,
    ServiceResponse,
    ServiceListResponse,
)
from app.services import service_service

router = APIRouter(prefix="/admin/services", tags=["Admin - Service Management"])


@router.get("", response_model=ServiceListResponse, dependencies=[Depends(admin_only)])
async def get_services(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    active_only: bool = Query(False),
    db: AsyncSession = Depends(get_db),
):
    """Danh sách tất cả dịch vụ"""
    return await service_service.list_services(db, page, limit, active_only)


@router.get("/{service_id}", response_model=ServiceResponse, dependencies=[Depends(admin_only)])
async def get_service(service_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Xem chi tiết một dịch vụ"""
    return await service_service.get_service_by_id(db, service_id)


@router.post("", response_model=ServiceResponse, dependencies=[Depends(admin_only)], status_code=201)
async def create_service(data: ServiceCreateRequest, db: AsyncSession = Depends(get_db)):
    """Tạo dịch vụ mới"""
    return await service_service.create_service(db, data)


@router.put("/{service_id}", response_model=ServiceResponse, dependencies=[Depends(admin_only)])
async def update_service(
    service_id: uuid.UUID,
    data: ServiceUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Cập nhật thông tin dịch vụ"""
    return await service_service.update_service(db, service_id, data)


@router.delete("/{service_id}", dependencies=[Depends(admin_only)])
async def delete_service(service_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Xoá dịch vụ"""
    return await service_service.delete_service(db, service_id)
