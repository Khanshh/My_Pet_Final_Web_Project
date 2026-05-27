import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import admin_only
from app.models.payment import PaymentStatus
from app.schemas.payment import (
    PaymentCreateRequest,
    PaymentUpdateStatusRequest,
    PaymentResponse,
    PaymentListResponse,
)
from app.services import payment_service

router = APIRouter(prefix="/admin/payments", tags=["Admin - Payment Management"])


@router.get("", response_model=PaymentListResponse, dependencies=[Depends(admin_only)])
async def get_payments(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[PaymentStatus] = None,
    owner_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_db),
):
    """Danh sách thanh toán"""
    return await payment_service.list_payments(db, page, limit, status, owner_id)


@router.post("", response_model=PaymentResponse, dependencies=[Depends(admin_only)], status_code=201)
async def create_payment(
    data: PaymentCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Tạo thanh toán mới"""
    return await payment_service.create_payment(db, data)


@router.patch("/{payment_id}/status", response_model=PaymentResponse, dependencies=[Depends(admin_only)])
async def update_payment_status(
    payment_id: uuid.UUID,
    data: PaymentUpdateStatusRequest,
    db: AsyncSession = Depends(get_db),
):
    """Cập nhật trạng thái thanh toán"""
    return await payment_service.update_payment_status(db, payment_id, data)
