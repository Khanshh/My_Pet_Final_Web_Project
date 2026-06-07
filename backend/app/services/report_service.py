import datetime
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.models.veterinarian import Veterinarian
from app.models.appointment import Appointment, AppointmentStatus
from app.models.payment import Payment, PaymentStatus

async def get_revenue_appointments_report(db: AsyncSession, start_date: datetime.date, end_date: datetime.date, group_by: str):
    # Determine the format string for PostgreSQL to_char based on group_by
    if group_by == 'month':
        date_format = 'YYYY-MM'
    elif group_by == 'year':
        date_format = 'YYYY'
    else: # day
        date_format = 'YYYY-MM-DD'

    # Revenue query
    revenue_stmt = (
        select(
            func.to_char(Payment.paid_at, date_format).label('date'),
            func.sum(Payment.amount).label('total_revenue')
        )
        .where(Payment.status == PaymentStatus.paid)
        .where(func.date(Payment.paid_at) >= start_date)
        .where(func.date(Payment.paid_at) <= end_date)
        .group_by('date')
        .order_by('date')
    )
    revenue_res = await db.execute(revenue_stmt)
    revenue_data = [{"date": row.date, "revenue": float(row.total_revenue or 0)} for row in revenue_res]

    # Appointments query
    app_stmt = (
        select(
            func.to_char(Appointment.created_at, date_format).label('date'),
            func.count().label('total_appointments'),
            func.sum(
                case((Appointment.status == AppointmentStatus.completed, 1), else_=0)
            ).label('completed_appointments')
        )
        .where(func.date(Appointment.created_at) >= start_date)
        .where(func.date(Appointment.created_at) <= end_date)
        .group_by('date')
        .order_by('date')
    )
    app_res = await db.execute(app_stmt)
    app_data = [{"date": row.date, "total": row.total_appointments, "completed": row.completed_appointments} for row in app_res]

    return {
        "revenue": revenue_data,
        "appointments": app_data
    }

async def get_user_growth_report(db: AsyncSession, start_date: datetime.date, end_date: datetime.date, group_by: str):
    if group_by == 'month':
        date_format = 'YYYY-MM'
    elif group_by == 'year':
        date_format = 'YYYY'
    else: # day
        date_format = 'YYYY-MM-DD'

    user_stmt = (
        select(
            func.to_char(User.created_at, date_format).label('date'),
            func.count().label('new_users')
        )
        .where(User.role == UserRole.owner)
        .where(func.date(User.created_at) >= start_date)
        .where(func.date(User.created_at) <= end_date)
        .group_by('date')
        .order_by('date')
    )
    user_res = await db.execute(user_stmt)
    user_data = [{"date": row.date, "new_users": row.new_users} for row in user_res]

    vet_stmt = (
        select(
            func.to_char(User.created_at, date_format).label('date'),
            func.count().label('new_vets')
        )
        .where(User.role == UserRole.vet)
        .where(func.date(User.created_at) >= start_date)
        .where(func.date(User.created_at) <= end_date)
        .group_by('date')
        .order_by('date')
    )
    vet_res = await db.execute(vet_stmt)
    vet_data = [{"date": row.date, "new_vets": row.new_vets} for row in vet_res]

    return {
        "new_users": user_data,
        "new_vets": vet_data
    }

async def get_vet_list_report(db: AsyncSession):
    stmt = (
        select(
            Veterinarian,
            User,
            func.count(Appointment.id).label('completed_appointments')
        )
        .join(User, User.id == Veterinarian.user_id)
        .outerjoin(Appointment, (Appointment.vet_id == Veterinarian.id) & (Appointment.status == AppointmentStatus.completed))
        .group_by(Veterinarian.id, User.id)
    )
    res = await db.execute(stmt)
    vets_data = []
    for vet, user, completed_appointments in res:
        vets_data.append({
            "id": str(vet.id),
            "full_name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "specialization": vet.specialization,
            "completed_appointments": completed_appointments
        })
    return vets_data
