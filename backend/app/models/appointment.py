import uuid
import enum
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy import Enum as sqlalchemy_Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.session import Base


class AppointmentStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"
    completed = "completed"


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    pet_id = Column(UUID(as_uuid=True), ForeignKey("pets.id"), nullable=False)
    vet_id = Column(UUID(as_uuid=True), ForeignKey("veterinarians.id"), nullable=False)
    service_id = Column(UUID(as_uuid=True), ForeignKey("services.id"), nullable=False)
    scheduled_at = Column(DateTime(timezone=True), nullable=False)
    status = Column(
        sqlalchemy_Enum(AppointmentStatus, name="appointment_status"),
        default=AppointmentStatus.pending,
        nullable=False,
    )
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    owner = relationship("User", foreign_keys=[owner_id])
    pet = relationship("Pet", foreign_keys=[pet_id])
    vet = relationship("Veterinarian", foreign_keys=[vet_id])
    service = relationship("Service", foreign_keys=[service_id])
