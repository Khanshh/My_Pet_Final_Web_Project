#!/usr/bin/env bash
# =============================================================================
#  apply_schema.sh — Chạy schema.sql vào PostgreSQL (qua Docker hoặc local)
#  Cách dùng:
#    chmod +x database/apply_schema.sh
#    ./database/apply_schema.sh            # dùng giá trị mặc định từ .env
#    ./database/apply_schema.sh --reset    # xoá DB rồi tạo lại từ đầu
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

# Đọc .env nếu tồn tại
if [ -f "$ENV_FILE" ]; then
    export $(grep -v '^#' "$ENV_FILE" | xargs)
fi

# Giá trị mặc định
PGUSER="${POSTGRES_USER:-mypet_user}"
PGPASSWORD="${POSTGRES_PASSWORD:-mypet_password}"
PGDATABASE="${POSTGRES_DB:-mypet_db}"
PGHOST="${POSTGRES_HOST:-localhost}"
PGPORT="${POSTGRES_PORT:-5432}"

SCHEMA_FILE="$SCRIPT_DIR/schema.sql"

export PGPASSWORD

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " MyPet — Apply Database Schema"
echo "  Host    : $PGHOST:$PGPORT"
echo "  Database: $PGDATABASE"
echo "  User    : $PGUSER"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Chế độ --reset: xoá và tạo lại DB
if [ "$1" = "--reset" ]; then
    echo "⚠️  Chế độ RESET: xoá và tạo lại database '$PGDATABASE'..."
    psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d postgres <<EOF
        -- Ngắt tất cả các kết nối đang active tới DB này
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = '$PGDATABASE'
          AND pid <> pg_backend_pid();
        
        DROP DATABASE IF EXISTS $PGDATABASE;
        CREATE DATABASE $PGDATABASE OWNER $PGUSER ENCODING 'UTF8';
EOF
    echo "✅ Database đã được tạo lại."
fi

echo "📄 Áp dụng schema.sql..."
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -f "$SCHEMA_FILE"

echo ""
echo "✅ Schema đã được áp dụng thành công!"
echo "   Kết nối: psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE"
