import uuid
from datetime import datetime, date
from typing import List, Optional
from pydantic import BaseModel

# Schema thông tin chủ sở hữu cơ bản
class OwnerBasicInfo(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str

    class Config:
        from_attributes = True

# Schema tạo thú cưng
class PetCreateRequest(BaseModel):
    name: str
    species: str
    breed: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: str
    avatar_url: Optional[str] = None
    owner_id: uuid.UUID

# Schema chi tiết thú cưng
class PetAdminResponse(BaseModel):
    id: uuid.UUID
    name: str
    species: str
    breed: Optional[str]
    date_of_birth: Optional[date]
    gender: str
    avatar_url: Optional[str]
    owner_id: uuid.UUID
    created_at: datetime
    owner: OwnerBasicInfo  # Lồng thông tin chủ

    class Config:
        from_attributes = True

# Schema cho danh sách phân trang
class PetListAdminResponse(BaseModel):
    items: List[PetAdminResponse]
    total: int
    page: int
    limit: int
    pages: int
