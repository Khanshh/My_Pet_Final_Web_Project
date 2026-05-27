import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.session import Base


class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    appointment_id = Column(
        UUID(as_uuid=True),
        ForeignKey("appointments.id", ondelete="RESTRICT"),
        unique=True,
        nullable=False,
    )
    pet_id = Column(UUID(as_uuid=True), ForeignKey("pets.id"), nullable=False)
    vet_id = Column(UUID(as_uuid=True), ForeignKey("veterinarians.id"), nullable=False)
    diagnosis = Column(Text, nullable=False)
    treatment = Column(Text, nullable=False)
    prescription = Column(Text)
    notes = Column(Text)
    recorded_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    appointment = relationship("Appointment", foreign_keys=[appointment_id])
    pet = relationship("Pet", foreign_keys=[pet_id])
    vet = relationship("Veterinarian", foreign_keys=[vet_id])
