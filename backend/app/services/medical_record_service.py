import uuid
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.models.medical_record import MedicalRecord
from app.schemas.medical_record import MedicalRecordCreateRequest, MedicalRecordListResponse


async def get_records_by_pet(
    db: AsyncSession, pet_id: uuid.UUID
) -> MedicalRecordListResponse:
    count = await db.scalar(
        select(func.count()).select_from(MedicalRecord).where(MedicalRecord.pet_id == pet_id)
    ) or 0

    result = await db.execute(
        select(MedicalRecord)
        .where(MedicalRecord.pet_id == pet_id)
        .order_by(MedicalRecord.recorded_at.desc())
    )
    items = result.scalars().all()
    return MedicalRecordListResponse(items=items, total=count)


async def create_record(
    db: AsyncSession, data: MedicalRecordCreateRequest
) -> MedicalRecord:
    record = MedicalRecord(
        appointment_id=data.appointment_id,
        pet_id=data.pet_id,
        vet_id=data.vet_id,
        diagnosis=data.diagnosis,
        treatment=data.treatment,
        prescription=data.prescription,
        notes=data.notes,
    )
    db.add(record)
    await db.flush()
    await db.refresh(record)
    return record


async def get_record_by_id(db: AsyncSession, record_id: uuid.UUID) -> MedicalRecord:
    result = await db.execute(
        select(MedicalRecord).where(MedicalRecord.id == record_id)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=404, detail="Hồ sơ bệnh án không tồn tại")
    return record
