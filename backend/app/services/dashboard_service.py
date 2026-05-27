from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.models.pet import Pet
from app.models.veterinarian import Veterinarian
from app.models.appointment import Appointment, AppointmentStatus
from app.models.payment import Payment, PaymentStatus
from app.models.service import Service

async def get_dashboard_stats(db: AsyncSession):
    # Đếm tổng số lượng cơ bản
    count_users = await db.scalar(select(func.count()).select_from(User))
    count_vets = await db.scalar(select(func.count()).select_from(Veterinarian))
    count_pets = await db.scalar(select(func.count()).select_from(Pet))
    count_owners = await db.scalar(
        select(func.count()).select_from(User).where(User.role == UserRole.owner)
    )
    count_services = await db.scalar(
        select(func.count()).select_from(Service).where(Service.is_active == True)
    )

    # Thống kê lịch hẹn
    count_appointments = await db.scalar(select(func.count()).select_from(Appointment))
    count_pending = await db.scalar(
        select(func.count()).select_from(Appointment)
        .where(Appointment.status == AppointmentStatus.pending)
    )
    count_confirmed = await db.scalar(
        select(func.count()).select_from(Appointment)
        .where(Appointment.status == AppointmentStatus.confirmed)
    )
    count_completed = await db.scalar(
        select(func.count()).select_from(Appointment)
        .where(Appointment.status == AppointmentStatus.completed)
    )
    count_cancelled = await db.scalar(
        select(func.count()).select_from(Appointment)
        .where(Appointment.status == AppointmentStatus.cancelled)
    )

    # Thống kê thanh toán
    total_revenue = await db.scalar(
        select(func.sum(Payment.amount))
        .where(Payment.status == PaymentStatus.paid)
    )
    count_payments_pending = await db.scalar(
        select(func.count()).select_from(Payment)
        .where(Payment.status == PaymentStatus.pending)
    )

    return {
        "total_users": count_users or 0,
        "total_vets": count_vets or 0,
        "total_pets": count_pets or 0,
        "total_owners": count_owners or 0,
        "total_services": count_services or 0,
        # Lịch hẹn
        "total_appointments": count_appointments or 0,
        "appointments_pending": count_pending or 0,
        "appointments_confirmed": count_confirmed or 0,
        "appointments_completed": count_completed or 0,
        "appointments_cancelled": count_cancelled or 0,
        # Doanh thu
        "total_revenue": float(total_revenue) if total_revenue else 0,
        "payments_pending": count_payments_pending or 0,
        # KPI cards
        "recent_stats": [
            {"label": "Người dùng", "value": count_users or 0},
            {"label": "Thú cưng", "value": count_pets or 0},
            {"label": "Bác sĩ", "value": count_vets or 0},
            {"label": "Lịch hẹn", "value": count_appointments or 0},
        ]
    }
