import uuid
import math
from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.models.pet import Pet
from app.models.user import User
from app.schemas.pet_admin import PetListAdminResponse

async def list_all_pets(
    db: AsyncSession,
    page: int = 1,
    limit: int = 10,
    species: Optional[str] = None,
    search: Optional[str] = None
) -> PetListAdminResponse:
    # 1. Base query với joinedload owner
    query = select(Pet).options(joinedload(Pet.owner))
    count_query = select(func.count()).select_from(Pet)

    # 2. Filters
    if species:
        query = query.where(Pet.species == species)
        count_query = count_query.where(Pet.species == species)
    
    if search:
        query = query.where(Pet.name.ilike(f"%{search}%"))
        count_query = count_query.where(Pet.name.ilike(f"%{search}%"))

    # 3. Pagination
    total = await db.scalar(count_query) or 0
    pages = math.ceil(total / limit) if total > 0 else 1
    
    result = await db.execute(
        query.order_by(Pet.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    items = result.scalars().all()

    return PetListAdminResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=pages
    )

async def get_pet_detail(db: AsyncSession, pet_id: uuid.UUID) -> Pet:
    result = await db.execute(
        select(Pet)
        .options(joinedload(Pet.owner))
        .where(Pet.id == pet_id)
    )
    pet = result.scalar_one_or_none()
    if not pet:
        raise HTTPException(status_code=404, detail="Thú cưng không tồn tại")
    return pet

async def list_pets_by_owner(db: AsyncSession, user_id: uuid.UUID) -> list[Pet]:
    # Kiểm tra user tồn tại
    user_exists = await db.scalar(select(User.id).where(User.id == user_id))
    if not user_exists:
        raise HTTPException(status_code=404, detail="Người dùng không tồn tại")

    result = await db.execute(
        select(Pet)
        .options(joinedload(Pet.owner))
        .where(Pet.owner_id == user_id)
        .order_by(Pet.created_at.desc())
    )
    return result.scalars().all()

async def create_pet(db: AsyncSession, data: any) -> Pet:
    # Check if owner exists
    owner = await db.get(User, data.owner_id)
    if not owner:
        raise HTTPException(status_code=404, detail="Chủ nuôi không tồn tại")
    
    pet = Pet(
        name=data.name,
        species=data.species,
        breed=data.breed,
        date_of_birth=data.date_of_birth,
        gender=data.gender,
        avatar_url=data.avatar_url,
        owner_id=data.owner_id
    )
    db.add(pet)
    await db.commit()
    await db.refresh(pet)
    
    # Refresh to load owner relationship
    return await get_pet_detail(db, pet.id)

async def delete_pet(db: AsyncSession, pet_id: uuid.UUID) -> bool:
    pet = await db.get(Pet, pet_id)
    if not pet:
        raise HTTPException(status_code=404, detail="Thú cưng không tồn tại")
    
    await db.delete(pet)
    await db.commit()
    return True
