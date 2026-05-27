"""
core/security.py
────────────────
Chứa tất cả logic mã hoá:
  - bcrypt: hash / verify password
  - JWT: tạo access_token (15 phút) và refresh_token (7 ngày)
  - JWT: decode và validate token
"""
import uuid
from datetime import datetime, timedelta, timezone

import uuid
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings

# ─────────────────────────── BCrypt (Direct) ───────────────────────────

def hash_password(plain_password: str) -> str:
    """Mã hoá mật khẩu bằng bcrypt trực tiếp."""
    # Bcrypt yêu cầu đầu vào là bytes
    pwd_bytes = plain_password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Kiểm tra mật khẩu có khớp với bản hash không."""
    try:
        pwd_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pwd_bytes, hashed_bytes)
    except Exception:
        return False


# ─────────────────────────── JWT ───────────────────────────

ACCESS_TOKEN_EXPIRE_SECONDS = settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
REFRESH_TOKEN_EXPIRE_SECONDS = 7 * 24 * 60 * 60  # 7 ngày


def _create_token(data: dict, expire_delta: timedelta) -> str:
    """Helper nội bộ tạo JWT với exp claim."""
    payload = data.copy()
    now = datetime.now(timezone.utc)
    payload.update({"iat": now, "exp": now + expire_delta})
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_access_token(user_id: uuid.UUID, role: str) -> str:
    """
    Tạo JWT access token.
    Payload: sub=user_id, role=role, type="access"
    Thời hạn: ACCESS_TOKEN_EXPIRE_MINUTES (mặc định 15 phút)
    """
    return _create_token(
        data={"sub": str(user_id), "role": role, "type": "access"},
        expire_delta=timedelta(seconds=ACCESS_TOKEN_EXPIRE_SECONDS),
    )


def create_refresh_token(user_id: uuid.UUID) -> tuple[str, datetime]:
    """
    Tạo JWT refresh token.
    Payload: sub=user_id, jti=random_uuid, type="refresh"
    Thời hạn: 7 ngày.
    Trả về: (token_string, expires_at_datetime)
    """
    jti = str(uuid.uuid4())
    expire = timedelta(seconds=REFRESH_TOKEN_EXPIRE_SECONDS)
    token = _create_token(
        data={"sub": str(user_id), "jti": jti, "type": "refresh"},
        expire_delta=expire,
    )
    expires_at = datetime.now(timezone.utc) + expire
    return token, expires_at


def decode_access_token(token: str) -> dict:
    """
    Decode và validate access token.
    Ném JWTError nếu token không hợp lệ hoặc hết hạn.
    """
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    if payload.get("type") != "access":
        raise JWTError("Sai loại token")
    return payload


def decode_refresh_token(token: str) -> dict:
    """
    Decode và validate refresh token.
    Ném JWTError nếu token không hợp lệ hoặc hết hạn.
    """
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    if payload.get("type") != "refresh":
        raise JWTError("Sai loại token")
    return payload
