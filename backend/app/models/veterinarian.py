import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.session import Base

class Veterinarian(Base):
    __tablename__ = "veterinarians"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    specialization = Column(String(200), nullable=False)
    bio = Column(Text)
    certificate_url = Column(String(255))
    is_active = Column(Boolean, default=True)

    # Quan hệ với bảng User
    user = relationship("User", back_populates="vet_profile")
