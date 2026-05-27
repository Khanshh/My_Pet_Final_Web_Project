"""
alembic/env.py
───────────────
Alembic migration environment.
Dùng sync driver (psycopg2) vì Alembic không hỗ trợ async natively.
"""
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# Import settings để lấy DATABASE_URL_SYNC
from app.core.config import settings

# Import Base và TẤT CẢ models để autogenerate phát hiện được
from app.db.session import Base
import app.models  # noqa: F401 — đảm bảo models được load

config = context.config

# Đọc logging config từ alembic.ini
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

# Override URL từ settings (dùng sync driver)
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL_SYNC)


def run_migrations_offline() -> None:
    """Chạy migrations ở chế độ offline (không cần kết nối DB thật)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Chạy migrations với kết nối DB thật."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
