import uuid
from sqlalchemy import Column, String, Boolean, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import DECIMAL

from app.db.session import Base


class Service(Base):
    __tablename__ = "services"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    price = Column(DECIMAL(10, 2), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
