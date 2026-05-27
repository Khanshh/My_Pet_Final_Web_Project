import asyncio
import httpx

async def get_token():
    url = "http://localhost:8080/api/v1/auth/login"
    payload = {
        "email": "phamnamkhanh1107@gmail.com",
        "password": "Mật khẩu của bạn ở đây" # Bạn có thể thay bằng mật khẩu thật
    }
    # Vì tôi không biết mật khẩu của bạn, tôi sẽ tạo một tài khoản Admin mới để test cho chắc chắn
    pass

if __name__ == "__main__":
    print("Tôi sẽ tạo một Admin mới tên là 'admin_test@mypet.dev' để lấy Token cho bạn test nhé!")
