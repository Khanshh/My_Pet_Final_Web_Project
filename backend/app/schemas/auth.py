import uuid
from datetime import datetime

from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator

from app.models.user import UserRole


# ─────────────────────────── Register ───────────────────────────

class RegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100, examples=["Nguyen Van A"])
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=64, examples=["StrongPass@1"])
    phone: str | None = Field(default=None, max_length=20)
    role: UserRole = UserRole.owner

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Mật khẩu phải có ít nhất 1 chữ hoa")
        if not any(c.isdigit() for c in v):
            raise ValueError("Mật khẩu phải có ít nhất 1 chữ số")
        return v


class RegisterResponse(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str
    phone: str | None = None
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────── Login ───────────────────────────

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds until access_token expires


# ─────────────────────────── Refresh ───────────────────────────

class RefreshRequest(BaseModel):
    refresh_token: str


class AccessTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


# ─────────────────────────── Logout ───────────────────────────

class LogoutRequest(BaseModel):
    refresh_token: str


# ─────────────────────────── Current User ───────────────────────────

class UserOut(BaseModel):
    id: uuid.UUID
    full_name: str
    email: str
    phone: str | None
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None
