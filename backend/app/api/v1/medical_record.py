import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import admin_only
from app.schemas.medical_record import (
    MedicalRecordCreateRequest,
    MedicalRecordResponse,
    MedicalRecordListResponse,
)
from app.services import medical_record_service

router = APIRouter(tags=["Admin - Medical Records"])


@router.get(
    "/admin/pets/{pet_id}/medical-records",
    response_model=MedicalRecordListResponse,
    dependencies=[Depends(admin_only)],
)
async def get_pet_records(
    pet_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Lấy danh sách hồ sơ bệnh án của một thú cưng"""
    return await medical_record_service.get_records_by_pet(db, pet_id)


@router.post(
    "/admin/medical-records",
    response_model=MedicalRecordResponse,
    dependencies=[Depends(admin_only)],
    status_code=201,
)
async def create_record(
    data: MedicalRecordCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Tạo hồ sơ bệnh án mới"""
    return await medical_record_service.create_record(db, data)


@router.get(
    "/admin/medical-records/{record_id}",
    response_model=MedicalRecordResponse,
    dependencies=[Depends(admin_only)],
)
async def get_record(
    record_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Xem chi tiết hồ sơ bệnh án"""
    return await medical_record_service.get_record_by_id(db, record_id)
