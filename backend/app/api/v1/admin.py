import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import admin_only
from app.models.user import User, UserRole
from app.schemas.admin import UserAdminResponse, UserListResponse
from app.schemas.auth import RegisterRequest
from app.services import admin_service, auth_service

router = APIRouter(prefix="/admin/users", tags=["Admin - User Management"])

@router.get("", response_model=UserListResponse, dependencies=[Depends(admin_only)])
async def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    role: Optional[UserRole] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Lấy danh sách người dùng (Admin only)"""
    return await admin_service.list_users(db, page, limit, role, search)

@router.get("/{user_id}", response_model=UserAdminResponse, dependencies=[Depends(admin_only)])
async def get_user_detail(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db)
):
    """Xem chi tiết một người dùng"""
    return await admin_service.get_user_by_id(db, user_id)

@router.post("", response_model=UserAdminResponse, status_code=201, dependencies=[Depends(admin_only)])
async def create_user(
    body: RegisterRequest,
    db: AsyncSession = Depends(get_db)
):
    """Tạo người dùng mới (Admin only)"""
    return await auth_service.register_user(body, db)

@router.patch("/{user_id}/lock", response_model=UserAdminResponse)
async def lock_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(admin_only)
):
    """Khoá tài khoản người dùng"""
    return await admin_service.update_user_status(db, user_id, False, current_admin.id)

@router.patch("/{user_id}/unlock", response_model=UserAdminResponse)
async def unlock_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(admin_only)
):
    """Mở khoá tài khoản người dùng"""
    return await admin_service.update_user_status(db, user_id, True, current_admin.id)
