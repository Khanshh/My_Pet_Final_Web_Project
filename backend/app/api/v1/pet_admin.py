import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import admin_only
from app.schemas.pet_admin import PetAdminResponse, PetListAdminResponse, PetCreateRequest
from app.services import pet_admin_service

router = APIRouter(tags=["Admin - Pet Management"])

@router.get("/admin/pets", response_model=PetListAdminResponse, dependencies=[Depends(admin_only)])
async def get_all_pets(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    species: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Danh sách tất cả thú cưng trong hệ thống (Admin only)"""
    return await pet_admin_service.list_all_pets(db, page, limit, species, search)

@router.post("/admin/pets", response_model=PetAdminResponse, dependencies=[Depends(admin_only)], status_code=201)
async def create_pet(
    data: PetCreateRequest,
    db: AsyncSession = Depends(get_db)
):
    """Tạo thú cưng mới (Admin only)"""
    return await pet_admin_service.create_pet(db, data)

@router.get("/admin/pets/{pet_id}", response_model=PetAdminResponse, dependencies=[Depends(admin_only)])
async def get_pet_detail(
    pet_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Xem chi tiết thú cưng kèm thông tin chủ (Admin only)"""
    return await pet_admin_service.get_pet_detail(db, pet_id)

@router.delete("/admin/pets/{pet_id}", dependencies=[Depends(admin_only)])
async def delete_pet(
    pet_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Xoá thú cưng (Admin only)"""
    await pet_admin_service.delete_pet(db, pet_id)
    return {"detail": "Xoá thú cưng thành công"}

@router.get("/admin/users/{user_id}/pets", response_model=List[PetAdminResponse], dependencies=[Depends(admin_only)])
async def get_user_pets(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Xem danh sách thú cưng của một chủ sở hữu cụ thể (Admin only)"""
    return await pet_admin_service.list_pets_by_owner(db, user_id)
