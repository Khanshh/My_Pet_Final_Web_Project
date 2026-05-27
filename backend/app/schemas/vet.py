import uuid
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

# Schema tạo mới (Gộp User & Vet Info)
class VetCreateRequest(BaseModel):
    full_name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=8)
    phone: Optional[str] = None
    specialization: str
    bio: Optional[str] = None
    certificate_url: Optional[str] = None

# Schema cập nhật
class VetUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None
    bio: Optional[str] = None
    certificate_url: Optional[str] = None

# Schema hiển thị cơ bản (User info)
class VetUserOut(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str
    phone: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True

# Schema trả về đầy đủ
class VetResponse(BaseModel):
    id: uuid.UUID
    specialization: str
    bio: Optional[str]
    certificate_url: Optional[str]
    is_active: bool
    user: VetUserOut

    class Config:
        from_attributes = True

# Schema phân trang
class VetListResponse(BaseModel):
    items: List[VetResponse]
    total: int
    page: int
    limit: int
    pages: int
