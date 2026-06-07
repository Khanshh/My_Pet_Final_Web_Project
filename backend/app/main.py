from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.core.dependencies import get_current_user, admin_only, vet_or_admin, require_role
from app.api.v1 import auth as auth_router
from app.api.v1 import admin as admin_router
from app.api.v1 import pet_admin as pet_admin_router
from app.api.v1 import vet as vet_router
from app.api.v1 import dashboard as dashboard_router
from app.api.v1 import service as service_router
from app.api.v1 import appointment as appointment_router
from app.api.v1 import medical_record as medical_record_router
from app.api.v1 import payment as payment_router
from app.api.v1 import doctor_appointments as doctor_appointments_router
from app.api.v1 import doctor_medical_records as doctor_medical_records_router
from app.api.v1 import doctor_stats as doctor_stats_router
from app.api.v1 import owner as owner_router
from app.api.v1 import upload as upload_router
from app.api.v1 import notification as notification_router
from app.api.v1 import messages as messages_router
from app.api.v1 import report as report_router
from app.models.user import User

app = FastAPI(
    title="MyPet API",
    description="Backend API cho hệ thống Pet Care Management",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─────────────────────────── CORS ───────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8000",
        "http://localhost:8001",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "https://petcare-mypet.netlify.app",
        "https://mypet-api.onrender.com",
    ],
    allow_origin_regex=r"https://.*\.netlify\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────── Routers ───────────────────────────

app.include_router(auth_router.router, prefix="/api/v1")
app.include_router(admin_router.router, prefix="/api/v1")
app.include_router(pet_admin_router.router, prefix="/api/v1")
app.include_router(vet_router.router, prefix="/api/v1")
app.include_router(dashboard_router.router, prefix="/api/v1")
app.include_router(service_router.router, prefix="/api/v1")
app.include_router(appointment_router.router, prefix="/api/v1")
app.include_router(medical_record_router.router, prefix="/api/v1")
app.include_router(payment_router.router, prefix="/api/v1")
app.include_router(doctor_appointments_router.router, prefix="/api/v1")
app.include_router(doctor_medical_records_router.router, prefix="/api/v1")
app.include_router(doctor_stats_router.router, prefix="/api/v1")
app.include_router(owner_router.router, prefix="/api/v1")
app.include_router(upload_router.router, prefix="/api/v1")
app.include_router(notification_router.router, prefix="/api/v1")
app.include_router(messages_router.router, prefix="/api/v1")
app.include_router(report_router.router, prefix="/api/v1")

# ─────────────────────────── Health ───────────────────────────

@app.get("/", tags=["Health"])
async def root():
    return {"message": "MyPet API is running 🐾", "version": "1.0.0"}


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}


# ─────────── Example: Protected routes với phân quyền ──────────

@app.get("/api/v1/protected/user-only", tags=["Examples"])
async def user_only_route(current_user: User = Depends(get_current_user)):
    """Chỉ cần đăng nhập — mọi role đều truy cập được."""
    return {"message": f"Xin chào {current_user.full_name}!", "role": current_user.role}


@app.get("/api/v1/protected/vet-area", tags=["Examples"])
async def vet_area(current_user: User = Depends(vet_or_admin)):
    """Chỉ vet hoặc admin mới vào được."""
    return {"message": "Khu vực bác sĩ thú y", "user": current_user.full_name}


@app.get("/api/v1/protected/admin-only", tags=["Examples"])
async def admin_only_route(current_user: User = Depends(admin_only)):
    """Chỉ admin mới vào được."""
    return {"message": "Khu vực quản trị", "user": current_user.full_name}
# ─────────────────────────── Static Files ───────────────────────────
from pathlib import Path

UPLOAD_BASE_DIR = Path(__file__).resolve().parent / "uploads"

if not os.path.exists(UPLOAD_BASE_DIR):
    os.makedirs(UPLOAD_BASE_DIR)

app.mount("/uploads", StaticFiles(directory=str(UPLOAD_BASE_DIR)), name="uploads")

if not os.path.exists(UPLOAD_BASE_DIR / "avatars"):
    os.makedirs(UPLOAD_BASE_DIR / "avatars")

if not os.path.exists(UPLOAD_BASE_DIR / "messages"):
    os.makedirs(UPLOAD_BASE_DIR / "messages")

if not os.path.exists(UPLOAD_BASE_DIR / "files"):
    os.makedirs(UPLOAD_BASE_DIR / "files")
