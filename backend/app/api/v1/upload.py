from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from app.core.dependencies import get_current_user
from app.core.file_upload import ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE
import uuid
import os
from pathlib import Path

router = APIRouter(prefix="/upload", tags=["Upload"])

from app.core.config import UPLOAD_DIR

UPLOAD_AVATAR_DIR = UPLOAD_DIR / "avatars"
UPLOAD_FILE_DIR = UPLOAD_DIR / "files"

@router.post("/avatar", dependencies=[Depends(get_current_user)])
async def upload_avatar(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ upload hình ảnh (jpg, png, webp, gif)")
    
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Kích thước file vượt quá 10MB")

    ext = Path(file.filename).suffix if file.filename else ".jpg"
    unique_name = f"{uuid.uuid4().hex}{ext}"
    
    os.makedirs(UPLOAD_AVATAR_DIR, exist_ok=True)
    
    file_path = UPLOAD_AVATAR_DIR / unique_name
    with open(file_path, "wb") as f:
        f.write(content)
        
    return {"url": f"/uploads/avatars/{unique_name}"}

@router.post("/file")
async def upload_general_file(file: UploadFile = File(...)):
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Kích thước file vượt quá 10MB")

    ext = Path(file.filename).suffix if file.filename else ""
    unique_name = f"{uuid.uuid4().hex}{ext}"
    
    os.makedirs(UPLOAD_FILE_DIR, exist_ok=True)
    
    file_path = UPLOAD_FILE_DIR / unique_name
    with open(file_path, "wb") as f:
        f.write(content)
        
    return {"data": {"url": f"/uploads/files/{unique_name}"}}
