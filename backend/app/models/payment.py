import uuid
import enum
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy import Enum as sqlalchemy_Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.types import DECIMAL

from app.db.session import Base


class PaymentMethod(str, enum.Enum):
    cash = "cash"
    card = "card"
    online = "online"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    refunded = "refunded"


class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    appointment_id = Column(
        UUID(as_uuid=True),
        ForeignKey("appointments.id", ondelete="RESTRICT"),
        unique=True,
        nullable=False,
    )
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    amount = Column(DECIMAL(10, 2), nullable=False)
    method = Column(
        sqlalchemy_Enum(PaymentMethod, name="payment_method"),
        nullable=False,
    )
    status = Column(
        sqlalchemy_Enum(PaymentStatus, name="payment_status"),
        default=PaymentStatus.pending,
        nullable=False,
    )
    transaction_id = Column(String(255))
    paid_at = Column(DateTime(timezone=True))

    # Relationships
    appointment = relationship("Appointment", foreign_keys=[appointment_id])
    owner = relationship("User", foreign_keys=[owner_id])
