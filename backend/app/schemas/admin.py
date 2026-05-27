import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr

from app.models.user import UserRole

# Schema trả về chi tiết user
class UserAdminResponse(BaseModel):
    id: uuid.UUID
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Schema cho danh sách phân trang
class UserListResponse(BaseModel):
    items: List[UserAdminResponse]
    total: int
    page: int
    limit: int
    pages: int
