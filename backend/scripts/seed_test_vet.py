import asyncio
import uuid
from app.db.session import AsyncSessionLocal
from app.models.user import User, UserRole
from app.models.veterinarian import Veterinarian
from app.core.security import hash_password

async def create_sample_vet():
    async with AsyncSessionLocal() as db:
        # 1. Kiểm tra bác sĩ đã tồn tại chưa
        email = "doctor.test@mypet.dev"
        from sqlalchemy import select
        res = await db.execute(select(User).where(User.email == email))
        if res.scalar_one_or_none():
            print(f"Bác sĩ {email} đã tồn tại trong hệ thống!")
            return

        # 2. Tạo User (Role VET)
        new_user = User(
            full_name="BS. Nguyễn Văn Thực Nghiệm",
            email=email,
            password_hash=hash_password("password123"),
            phone="0987654321",
            role=UserRole.vet,
            is_active=True
        )
        db.add(new_user)
        await db.flush()

        # 3. Tạo Profile Veterinarian
        new_vet = Veterinarian(
            user_id=new_user.id,
            specialization="Chuyên gia phẫu thuật chỉnh hình thú cưng",
            bio="Bác sĩ có nhiều năm kinh nghiệm điều trị các ca chấn thương phức tạp cho thú cưng.",
            certificate_url="http://example.com/cert.pdf",
            is_active=True
        )
        db.add(new_vet)
        await db.commit()
        print(f"✅ Đã tạo thành công bác sĩ: {new_user.full_name}")

if __name__ == "__main__":
    asyncio.run(create_sample_vet())
