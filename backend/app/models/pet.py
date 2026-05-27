import uuid
import enum
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Date, Enum as sqlalchemy_Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.session import Base

class PetGender(str, enum.Enum):
    male = "male"
    female = "female"
    unknown = "unknown"

class Pet(Base):
    __tablename__ = "pets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    species = Column(String(50), nullable=False)  # Ví dụ: Dog, Cat
    breed = Column(String(100))
    date_of_birth = Column(Date)
    gender = Column(sqlalchemy_Enum(PetGender, name="pet_gender"), default=PetGender.unknown)
    avatar_url = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Quan hệ với bảng User
    owner = relationship("User", back_populates="pets")
