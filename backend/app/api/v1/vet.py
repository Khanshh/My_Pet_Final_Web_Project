import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import admin_only
from app.schemas.vet import VetCreateRequest, VetUpdateRequest, VetResponse, VetListResponse
from app.services import vet_service

router = APIRouter(prefix="/admin/vets", tags=["Admin - Veterinarian Management"])

@router.get("", response_model=VetListResponse, dependencies=[Depends(admin_only)])
async def get_vets(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Danh sách tất cả bác sĩ"""
    return await vet_service.list_vets(db, page, limit)

@router.get("/{vet_id}", response_model=VetResponse, dependencies=[Depends(admin_only)])
async def get_vet(vet_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Xem chi tiết bác sĩ"""
    return await vet_service.get_vet_by_id(db, vet_id)

@router.post("", response_model=VetResponse, dependencies=[Depends(admin_only)], status_code=201)
async def create_vet(data: VetCreateRequest, db: AsyncSession = Depends(get_db)):
    """Tạo bác sĩ mới (Tạo cả User & Profile)"""
    return await vet_service.create_vet(db, data)

@router.put("/{vet_id}", response_model=VetResponse, dependencies=[Depends(admin_only)])
async def update_vet(vet_id: uuid.UUID, data: VetUpdateRequest, db: AsyncSession = Depends(get_db)):
    """Cập nhật thông tin bác sĩ"""
    return await vet_service.update_vet(db, vet_id, data)

@router.patch("/{vet_id}/toggle", response_model=VetResponse, dependencies=[Depends(admin_only)])
async def toggle_vet(vet_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Bật/Tắt trạng thái hoạt động bác sĩ"""
    return await vet_service.toggle_vet_status(db, vet_id)

@router.delete("/{vet_id}", dependencies=[Depends(admin_only)])
async def delete_vet(vet_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Xoá vĩnh viễn tài khoản bác sĩ"""
    return await vet_service.delete_vet_account(db, vet_id)
