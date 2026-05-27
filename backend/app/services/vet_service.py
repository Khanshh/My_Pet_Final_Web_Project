import uuid
import math
from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.models.veterinarian import Veterinarian
from app.core.security import hash_password
from app.schemas.vet import VetCreateRequest, VetUpdateRequest, VetListResponse

async def list_vets(db: AsyncSession, page: int = 1, limit: int = 10) -> VetListResponse:
    query = select(Veterinarian).options(joinedload(Veterinarian.user))
    count_query = select(func.count()).select_from(Veterinarian)

    total = await db.scalar(count_query) or 0
    pages = math.ceil(total / limit) if total > 0 else 1
    
    result = await db.execute(
        query.offset((page - 1) * limit).limit(limit)
    )
    items = result.scalars().all()

    return VetListResponse(items=items, total=total, page=page, limit=limit, pages=pages)

async def create_vet(db: AsyncSession, data: VetCreateRequest) -> Veterinarian:
    # 1. Kiểm tra email trùng
    existing_user = await db.scalar(select(User).where(User.email == data.email))
    if existing_user:
        raise HTTPException(status_code=409, detail="Email này đã được sử dụng")

    # 2. Tạo User (Role = VET)
    user = User(
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(data.password),
        phone=data.phone,
        role=UserRole.vet,
        is_active=True
    )
    db.add(user)
    await db.flush()

    # 3. Tạo Veterinarian profile
    vet = Veterinarian(
        user_id=user.id,
        specialization=data.specialization,
        bio=data.bio,
        certificate_url=data.certificate_url
    )
    db.add(vet)
    await db.commit()
    
    # Nạp lại dữ liệu vet kèm theo user để tránh lỗi lazy load
    result = await db.execute(
        select(Veterinarian)
        .options(joinedload(Veterinarian.user))
        .where(Veterinarian.id == vet.id)
    )
    return result.scalar_one()

async def get_vet_by_id(db: AsyncSession, vet_id: uuid.UUID) -> Veterinarian:
    result = await db.execute(
        select(Veterinarian).options(joinedload(Veterinarian.user)).where(Veterinarian.id == vet_id)
    )
    vet = result.scalar_one_or_none()
    if not vet:
        raise HTTPException(status_code=404, detail="Không tìm thấy bác sĩ này")
    return vet

async def update_vet(db: AsyncSession, vet_id: uuid.UUID, data: VetUpdateRequest) -> Veterinarian:
    vet = await get_vet_by_id(db, vet_id)
    
    # Cập nhật Vet profile
    if data.specialization is not None: vet.specialization = data.specialization
    if data.bio is not None: vet.bio = data.bio
    if data.certificate_url is not None: vet.certificate_url = data.certificate_url
    
    # Cập nhật User info lồng bên trong
    if data.full_name is not None: vet.user.full_name = data.full_name
    if data.phone is not None: vet.user.phone = data.phone
    
    await db.commit()
    await db.refresh(vet)
    return vet

async def toggle_vet_status(db: AsyncSession, vet_id: uuid.UUID) -> Veterinarian:
    vet = await get_vet_by_id(db, vet_id)
    vet.is_active = not vet.is_active
    await db.commit()
    await db.refresh(vet)
    return vet

async def delete_vet_account(db: AsyncSession, vet_id: uuid.UUID):
    vet = await get_vet_by_id(db, vet_id)
    # Xoá user thì vet sẽ tự động bị xoá do CASCADE
    await db.delete(vet.user)
    await db.commit()
    return {"detail": "Đã xoá tài khoản bác sĩ thành công"}
