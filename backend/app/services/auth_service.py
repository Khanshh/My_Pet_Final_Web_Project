"""
services/auth_service.py
─────────────────────────
Chứa toàn bộ business logic của Auth:
  - register_user
  - login_user
  - refresh_access_token
  - logout_user
"""
import uuid
from datetime import datetime, timezone

from fastapi import HTTPException, status
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    ACCESS_TOKEN_EXPIRE_SECONDS,
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    verify_password,
)
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.schemas.auth import (
    AccessTokenResponse,
    LoginRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
    UserOut,
    UserUpdate,
)


async def register_user(data: RegisterRequest, db: AsyncSession) -> RegisterResponse:
    """
    Đăng ký user mới.
    - Kiểm tra email trùng
    - Hash password bằng bcrypt
    - Lưu vào DB
    """
    # Kiểm tra email tồn tại
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email đã được sử dụng",
        )

    user = User(
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(data.password),
        phone=data.phone,
        role=data.role,
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return RegisterResponse.model_validate(user)


async def login_user(data: LoginRequest, db: AsyncSession) -> TokenResponse:
    """
    Đăng nhập.
    - Tìm user theo email
    - Verify bcrypt password
    - Tạo access_token (JWT 15 phút) + refresh_token (JWT 7 ngày)
    - Lưu refresh_token vào DB
    """
    result = await db.execute(select(User).where(User.email == data.email))
    user: User | None = result.scalar_one_or_none()

    # Cố tình không phân biệt "email sai" vs "mật khẩu sai" → tránh user enumeration
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không đúng",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị vô hiệu hoá",
        )

    access_token = create_access_token(user.id, user.role.value)
    refresh_token_str, expires_at = create_refresh_token(user.id)

    rt = RefreshToken(
        user_id=user.id,
        token=refresh_token_str,
        expires_at=expires_at,
        revoked=False,
    )
    db.add(rt)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token_str,
        expires_in=ACCESS_TOKEN_EXPIRE_SECONDS,
    )


async def refresh_access_token(refresh_token: str, db: AsyncSession) -> AccessTokenResponse:
    """
    Đổi refresh_token lấy access_token mới.
    - Decode JWT refresh token
    - Tìm trong DB, kiểm tra chưa bị revoke và chưa hết hạn
    - Tạo access_token mới
    """
    invalid_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Refresh token không hợp lệ hoặc đã hết hạn",
    )

    try:
        payload = decode_refresh_token(refresh_token)
        user_id = uuid.UUID(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise invalid_exc

    result = await db.execute(
        select(RefreshToken).where(RefreshToken.token == refresh_token)
    )
    rt: RefreshToken | None = result.scalar_one_or_none()

    if rt is None or rt.revoked:
        raise invalid_exc
    if rt.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise invalid_exc

    # Lấy role từ DB (không tin payload cũ)
    user_result = await db.execute(select(User).where(User.id == user_id))
    user: User | None = user_result.scalar_one_or_none()
    if not user or not user.is_active:
        raise invalid_exc

    new_access_token = create_access_token(user.id, user.role.value)

    return AccessTokenResponse(
        access_token=new_access_token,
        expires_in=ACCESS_TOKEN_EXPIRE_SECONDS,
    )


async def logout_user(refresh_token: str, db: AsyncSession) -> dict:
    """
    Logout: revoke refresh token trong DB.
    """
    result = await db.execute(
        select(RefreshToken).where(RefreshToken.token == refresh_token)
    )
    rt: RefreshToken | None = result.scalar_one_or_none()

    if rt and not rt.revoked:
        rt.revoked = True

    return {"detail": "Đăng xuất thành công"}


async def update_user_profile(db: AsyncSession, user: User, data: UserUpdate) -> User:
    """
    Cập nhật thông tin cá nhân.
    """
    if data.full_name is not None:
        user.full_name = data.full_name
    if data.phone is not None:
        user.phone = data.phone
    if data.password is not None:
        user.password_hash = hash_password(data.password)

    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
