# MyPet Backend

Backend của dự án MyPet, xây dựng bằng **FastAPI** + **PostgreSQL**.

## Cấu trúc thư mục

```
backend/
├── app/
│   ├── api/            # Route handlers
│   │   └── v1/
│   ├── core/           # Config, security, dependencies
│   ├── db/             # Database session, base model
│   ├── models/         # SQLAlchemy ORM models
│   ├── schemas/        # Pydantic schemas
│   ├── services/       # Business logic
│   └── main.py         # FastAPI app entry point
├── alembic/            # Database migrations
├── tests/              # Unit & integration tests
├── docker-compose.yml  # PostgreSQL via Docker
├── .env.example        # Mẫu biến môi trường
├── requirements.txt    # Python dependencies
└── README.md
```

## Khởi động nhanh

### 1. Khởi động PostgreSQL bằng Docker

```bash
cd backend
cp .env.example .env
docker compose up -d
```

### 2. Cài đặt Python dependencies

```bash
python -m venv venv
source venv/bin/activate       # Linux/Mac
# venv\Scripts\activate        # Windows

pip install -r requirements.txt
```

### 3. Chạy migrations (sau khi cài alembic)

```bash
alembic upgrade head
```

### 4. Chạy server

```bash
uvicorn app.main:app --reload --port 8080
```

API docs: http://localhost:8080/docs

## Database

| Thông số | Giá trị mặc định |
|---|---|
| Host | `localhost` |
| Port | `5432` |
| Database | `mypet_db` |
| User | `mypet_user` |
| Password | `mypet_password` |

> Thay đổi thông số trong file `.env`

## Docker commands

```bash
# Khởi động DB
docker compose up -d

# Dừng DB
docker compose down

# Xem logs
docker compose logs -f db

# Xoá dữ liệu (reset DB)
docker compose down -v
```
