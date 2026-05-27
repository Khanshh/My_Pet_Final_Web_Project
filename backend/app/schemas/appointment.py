import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.appointment import AppointmentStatus


# ── Nested schemas for rich responses ──

class AppointmentOwnerInfo(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str
    phone: Optional[str] = None

    class Config:
        from_attributes = True


class AppointmentPetInfo(BaseModel):
    id: uuid.UUID
    name: str
    species: str
    breed: Optional[str] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class AppointmentVetInfo(BaseModel):
    id: uuid.UUID
    specialization: str

    class Config:
        from_attributes = True


class AppointmentServiceInfo(BaseModel):
    id: uuid.UUID
    name: str
    price: float
    duration_minutes: int

    class Config:
        from_attributes = True


# ── Request schemas ──

class AppointmentCreateRequest(BaseModel):
    owner_id: uuid.UUID
    pet_id: uuid.UUID
    vet_id: uuid.UUID
    service_id: uuid.UUID
    scheduled_at: datetime
    notes: Optional[str] = None


class AppointmentUpdateStatusRequest(BaseModel):
    status: AppointmentStatus


# ── Response schemas ──

class AppointmentResponse(BaseModel):
    id: uuid.UUID
    owner_id: uuid.UUID
    pet_id: uuid.UUID
    vet_id: uuid.UUID
    service_id: uuid.UUID
    scheduled_at: datetime
    status: AppointmentStatus
    notes: Optional[str]
    created_at: datetime
    # Rich nested info
    owner: Optional[AppointmentOwnerInfo] = None
    pet: Optional[AppointmentPetInfo] = None
    vet: Optional[AppointmentVetInfo] = None
    service: Optional[AppointmentServiceInfo] = None

    class Config:
        from_attributes = True


class AppointmentListResponse(BaseModel):
    items: List[AppointmentResponse]
    total: int
    page: int
    limit: int
    pages: int
