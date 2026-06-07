import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import admin_only
from app.services import report_service

router = APIRouter(prefix="/admin/reports", tags=["Admin - Reports"])

@router.get("/export", dependencies=[Depends(admin_only)])
async def export_report(
    report_type: str = Query(..., description="revenue_appointments, users_vets, or doctors_list"),
    start_date: Optional[datetime.date] = None,
    end_date: Optional[datetime.date] = None,
    group_by: str = Query("day", description="day, month, or year"),
    db: AsyncSession = Depends(get_db)
):
    """
    Xuất dữ liệu báo cáo tùy chọn
    """
    if not start_date:
        start_date = datetime.date(2000, 1, 1)
    if not end_date:
        end_date = datetime.date(2100, 1, 1)
        
    if report_type == "revenue_appointments":
        return await report_service.get_revenue_appointments_report(db, start_date, end_date, group_by)
    elif report_type == "users_vets":
        return await report_service.get_user_growth_report(db, start_date, end_date, group_by)
    elif report_type == "doctors_list":
        return await report_service.get_vet_list_report(db)
    else:
        return {"error": "Invalid report_type"}
