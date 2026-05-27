import uuid
from typing import List, Optional
from decimal import Decimal
from pydantic import BaseModel, Field


class ServiceCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    price: Decimal = Field(..., ge=0)
    duration_minutes: int = Field(..., gt=0)
    is_active: bool = True


class ServiceUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    duration_minutes: Optional[int] = None
    is_active: Optional[bool] = None


class ServiceResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    price: Decimal
    duration_minutes: int
    is_active: bool

    class Config:
        from_attributes = True


class ServiceListResponse(BaseModel):
    items: List[ServiceResponse]
    total: int
    page: int
    limit: int
    pages: int
