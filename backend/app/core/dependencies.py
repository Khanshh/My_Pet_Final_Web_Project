"""
core/dependencies.py
─────────────────────
FastAPI dependencies và RBAC decorator:

  get_current_user  → Dependency lấy user từ Bearer JWT
  require_role(...)  → Decorator / Dependency kiểm tra role
"""
import uuid
from functools import wraps
from typing import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User, UserRole

# Bearer scheme — tự động đọc header "Authorization: Bearer <token>"
_bearer_scheme = HTTPBearer(auto_error=True)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Dependency: giải mã JWT từ Authorization header, truy vấn DB lấy user.
    Ném 401 nếu token không hợp lệ / user không tồn tại / bị deactivate.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token không hợp lệ hoặc đã hết hạn",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(credentials.credentials)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user: User | None = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản đã bị vô hiệu hoá",
        )
    return user


def require_role(*roles: str | UserRole) -> Callable:
    """
    Decorator / Dependency factory kiểm tra role.

    Dùng như dependency:
        @router.get("/admin-only")
        async def handler(user = Depends(require_role("admin"))):
            ...

    Hoặc dùng như decorator với route đã có current_user:
        @router.get("/vet-area")
        @require_role("vet", "admin")          ← chưa hỗ trợ trực tiếp, xem lưu ý bên dưới
        async def handler(...):
            ...

    LƯU Ý: Với FastAPI, nên dùng dạng Depends vì nó tích hợp với DI container:
        Depends(require_role("admin"))
    """
    allowed: set[str] = {r.value if isinstance(r, UserRole) else r for r in roles}

    async def _check(
        current_user: User = Depends(get_current_user),
    ) -> User:
        if current_user.role.value not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Chỉ {', '.join(allowed)} mới có quyền truy cập",
            )
        return current_user

    return _check


# ─────── Shortcut dependencies ────────────────────────────────

# Dùng: Depends(admin_only)
admin_only = require_role(UserRole.admin)

# Dùng: Depends(vet_or_admin)
vet_or_admin = require_role(UserRole.vet, UserRole.admin)
