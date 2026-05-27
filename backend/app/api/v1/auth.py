"""
api/v1/auth.py
───────────────
Auth routes:
  POST /auth/register
  POST /auth/login
  POST /auth/refresh
  POST /auth/logout
  GET  /auth/me       ← lấy thông tin user hiện tại (cần token)
"""
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.schemas.auth import (
    AccessTokenResponse,
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    RegisterRequest,
    RegisterResponse,
    TokenResponse,
    UserOut,
    UserUpdate,
)
from app.services import auth_service
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post(
    "/register",
    response_model=RegisterResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Đăng ký tài khoản mới",
)
async def register(
    body: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> RegisterResponse:
    return await auth_service.register_user(body, db)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Đăng nhập — trả về access_token + refresh_token",
)
async def login(
    body: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    return await auth_service.login_user(body, db)


@router.post(
    "/refresh",
    response_model=AccessTokenResponse,
    summary="Dùng refresh_token để lấy access_token mới",
)
async def refresh(
    body: RefreshRequest,
    db: AsyncSession = Depends(get_db),
) -> AccessTokenResponse:
    return await auth_service.refresh_access_token(body.refresh_token, db)


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Đăng xuất — revoke refresh_token",
)
async def logout(
    body: LogoutRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    return await auth_service.logout_user(body.refresh_token, db)


@router.get(
    "/me",
    response_model=UserOut,
    summary="Lấy thông tin user đang đăng nhập",
)
async def me(
    current_user: User = Depends(get_current_user),
) -> UserOut:
    return UserOut.model_validate(current_user)


@router.patch(
    "/me",
    response_model=UserOut,
    summary="Cập nhật thông tin cá nhân",
)
async def update_me(
    body: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserOut:
    return await auth_service.update_user_profile(db, current_user, body)
