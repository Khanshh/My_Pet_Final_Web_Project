import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel

from app.models.payment import PaymentMethod, PaymentStatus


class PaymentCreateRequest(BaseModel):
    appointment_id: uuid.UUID
    owner_id: uuid.UUID
    amount: Decimal
    method: PaymentMethod


class PaymentUpdateStatusRequest(BaseModel):
    status: PaymentStatus
    transaction_id: Optional[str] = None


class PaymentResponse(BaseModel):
    id: uuid.UUID
    appointment_id: uuid.UUID
    owner_id: uuid.UUID
    amount: Decimal
    method: PaymentMethod
    status: PaymentStatus
    transaction_id: Optional[str]
    paid_at: Optional[datetime]

    class Config:
        from_attributes = True


class PaymentListResponse(BaseModel):
    items: List[PaymentResponse]
    total: int
    page: int
    limit: int
    pages: int
