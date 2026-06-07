import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.schemas.pet_admin import PetAdminResponse, PetCreateRequest
from app.schemas.appointment import AppointmentResponse, AppointmentCreateRequest
from app.schemas.medical_record import MedicalRecordResponse
from app.schemas.payment import PaymentResponse
from app.schemas.service import ServiceResponse, ServiceListResponse
from app.schemas.vet import VetResponse, VetListResponse
from app.services import pet_admin_service, appointment_service, medical_record_service, payment_service, service_service, vet_service
from app.models.user import User

router = APIRouter(prefix="/owner", tags=["Owner Portal"])

@router.get("/pets", response_model=List[PetAdminResponse])
async def get_my_pets(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Danh sách thú cưng của tôi"""
    return await pet_admin_service.list_pets_by_owner(db, current_user.id)

@router.post("/pets", response_model=PetAdminResponse, status_code=201)
async def add_my_pet(
    data: PetCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Đăng ký thú cưng mới cho tôi"""
    # Đảm bảo owner_id là của current_user
    data.owner_id = current_user.id
    return await pet_admin_service.create_pet(db, data)

@router.get("/appointments", response_model=List[AppointmentResponse])
async def get_my_appointments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Lịch hẹn của tôi"""
    res = await appointment_service.list_appointments(db, page=1, limit=100, owner_id=current_user.id)
    return res.items

@router.post("/appointments", response_model=AppointmentResponse, status_code=201)
async def book_appointment(
    data: AppointmentCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Đặt lịch hẹn mới"""
    # Force current user as owner
    data.owner_id = current_user.id
    return await appointment_service.create_appointment(db, data)

@router.delete("/appointments/{appointment_id}")
async def cancel_my_appointment(
    appointment_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Hủy lịch hẹn của tôi"""
    from app.schemas.appointment import AppointmentUpdateStatusRequest
    from app.models.appointment import AppointmentStatus
    app = await appointment_service.get_appointment_by_id(db, appointment_id)
    if not app or str(app.owner_id) != str(current_user.id):
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Bạn không có quyền hủy lịch hẹn này")
    
    await appointment_service.update_appointment_status(
        db, appointment_id, AppointmentUpdateStatusRequest(status=AppointmentStatus.cancelled)
    )
    return {"detail": "Hủy lịch hẹn thành công"}

@router.get("/medical-records", response_model=List[MedicalRecordResponse])
async def get_my_pets_medical_records(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Hồ sơ bệnh án của tất cả pet của tôi"""
    records = await medical_record_service.list_records_by_owner(db, current_user.id)
    return records

@router.get("/payments", response_model=List[PaymentResponse])
async def get_my_payments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Lịch sử thanh toán của tôi"""
    return await payment_service.get_payments_by_owner(db, current_user.id)

@router.get("/services", response_model=ServiceListResponse)
async def get_available_services(
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Danh sách dịch vụ khả dụng (chỉ active)"""
    return await service_service.list_services(db, page, limit, active_only=True)

@router.get("/vets", response_model=VetListResponse)
async def get_available_vets(
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Danh sách bác sĩ thú y"""
    return await vet_service.list_vets(db, page, limit)

@router.put("/pets/{pet_id}", response_model=PetAdminResponse)
async def update_my_pet(
    pet_id: uuid.UUID,
    data: PetCreateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Cập nhật thông tin thú cưng của tôi"""
    # Kiểm tra quyền sở hữu
    pet = await pet_admin_service.get_pet_detail(db, pet_id)
    if not pet or str(pet.owner_id) != str(current_user.id):
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Bạn không có quyền chỉnh sửa thú cưng này")
    
    # Đảm bảo vẫn giữ nguyên chủ sở hữu
    data.owner_id = current_user.id
    return await pet_admin_service.update_pet(db, pet_id, data)

@router.delete("/pets/{pet_id}")
async def delete_my_pet(
    pet_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Xoá thú cưng của tôi"""
    # Kiểm tra quyền sở hữu
    pet = await pet_admin_service.get_pet_detail(db, pet_id)
    if not pet or str(pet.owner_id) != str(current_user.id):
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Bạn không có quyền xoá thú cưng này")
    
    await pet_admin_service.delete_pet(db, pet_id)
    return {"detail": "Xoá thú cưng thành công"}
