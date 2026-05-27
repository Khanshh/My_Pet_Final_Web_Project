import uuid
import math
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.models.payment import Payment, PaymentStatus
from app.schemas.payment import (
    PaymentCreateRequest,
    PaymentUpdateStatusRequest,
    PaymentListResponse,
)


async def list_payments(
    db: AsyncSession,
    page: int = 1,
    limit: int = 10,
    status: Optional[PaymentStatus] = None,
    owner_id: Optional[uuid.UUID] = None,
) -> PaymentListResponse:
    query = select(Payment)
    count_query = select(func.count()).select_from(Payment)

    if status:
        query = query.where(Payment.status == status)
        count_query = count_query.where(Payment.status == status)

    if owner_id:
        query = query.where(Payment.owner_id == owner_id)
        count_query = count_query.where(Payment.owner_id == owner_id)

    total = await db.scalar(count_query) or 0
    pages = math.ceil(total / limit) if total > 0 else 1

    result = await db.execute(
        query.order_by(Payment.paid_at.desc().nullslast())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    items = result.scalars().all()

    return PaymentListResponse(
        items=items, total=total, page=page, limit=limit, pages=pages
    )


async def create_payment(db: AsyncSession, data: PaymentCreateRequest) -> Payment:
    payment = Payment(
        appointment_id=data.appointment_id,
        owner_id=data.owner_id,
        amount=data.amount,
        method=data.method,
        status=PaymentStatus.pending,
    )
    db.add(payment)
    await db.flush()
    await db.refresh(payment)
    return payment


async def update_payment_status(
    db: AsyncSession,
    payment_id: uuid.UUID,
    data: PaymentUpdateStatusRequest,
) -> Payment:
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Thanh toán không tồn tại")

    payment.status = data.status
    if data.transaction_id:
        payment.transaction_id = data.transaction_id
    if data.status == PaymentStatus.paid and payment.paid_at is None:
        payment.paid_at = datetime.now(timezone.utc)

    await db.flush()
    await db.refresh(payment)
    return payment


async def get_payments_by_owner(db: AsyncSession, owner_id: uuid.UUID) -> list[Payment]:
    result = await db.execute(
        select(Payment)
        .where(Payment.owner_id == owner_id)
        .order_by(Payment.paid_at.desc().nullslast())
    )
    return result.scalars().all()
