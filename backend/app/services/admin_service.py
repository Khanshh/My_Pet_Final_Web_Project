import uuid
import math
from typing import Optional
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.schemas.admin import UserListResponse

async def list_users(
    db: AsyncSession,
    page: int = 1,
    limit: int = 10,
    role: Optional[UserRole] = None,
    search: Optional[str] = None
) -> UserListResponse:
    # 1. Base query
    query = select(User)
    count_query = select(func.count()).select_from(User)

    # 2. Filters
    if role:
        query = query.where(User.role == role)
        count_query = count_query.where(User.role == role)
    
    if search:
        search_filter = or_(
            User.full_name.ilike(f"%{search}%"),
            User.email.ilike(f"%{search}%")
        )
        query = query.where(search_filter)
        count_query = count_query.where(search_filter)

    # 3. Pagination
    total = await db.scalar(count_query) or 0
    pages = math.ceil(total / limit) if total > 0 else 1
    
    result = await db.execute(
        query.order_by(User.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    items = result.scalars().all()

    return UserListResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=pages
    )

async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User:
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại")
    return user

async def update_user_status(
    db: AsyncSession, 
    user_id: uuid.UUID, 
    active: bool,
    current_admin_id: uuid.UUID
) -> User:
    # Ràng buộc: Không được tự khóa chính mình
    if user_id == current_admin_id and not active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bạn không thể tự khoá tài khoản của chính mình"
        )

    user = await get_user_by_id(db, user_id)
    user.is_active = active
    await db.commit()
    await db.refresh(user)
    return user
