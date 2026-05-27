import asyncio
from app.db.session import AsyncSessionLocal
from app.models.user import User, UserRole
from app.core.security import hash_password
from sqlalchemy import select

async def create_test_admin():
    async with AsyncSessionLocal() as db:
        email = "admin_test@mypet.dev"
        res = await db.execute(select(User).where(User.email == email))
        if res.scalar_one_or_none():
            print(f"Admin {email} đã tồn tại.")
            return

        user = User(
            full_name="Admin Test API",
            email=email,
            password_hash=hash_password("admin123"),
            role=UserRole.admin,
            is_active=True
        )
        db.add(user)
        await db.commit()
        print(f"✅ Đã tạo Admin: {email} / Pass: admin123")

if __name__ == "__main__":
    asyncio.run(create_test_admin())
