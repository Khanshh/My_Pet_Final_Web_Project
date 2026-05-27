from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import admin_only
from app.services import dashboard_service

router = APIRouter(prefix="/admin/dashboard", tags=["Admin - Dashboard"])

@router.get("/stats", dependencies=[Depends(admin_only)])
async def get_stats(db: AsyncSession = Depends(get_db)):
    """Lấy dữ liệu thống kê tổng quan cho Dashboard (Admin only)"""
    return await dashboard_service.get_dashboard_stats(db)
