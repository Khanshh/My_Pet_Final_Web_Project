-- =============================================================================
--  Pet Care Management System — Full Database Schema
--  Database : PostgreSQL 16+
--  Encoding : UTF-8
--  Created  : 2026-05-19
-- =============================================================================

-- Extension để tự động generate UUID v4
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
--  SECTION 1 — ENUM TYPES
--  (phải tạo trước khi CREATE TABLE dùng chúng)
-- =============================================================================

-- Vai trò người dùng
CREATE TYPE user_role AS ENUM ('owner', 'vet', 'admin');

-- Giới tính thú cưng
CREATE TYPE pet_gender AS ENUM ('male', 'female', 'unknown');

-- Trạng thái lịch hẹn
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Phương thức thanh toán
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'online');

-- Trạng thái thanh toán
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');

-- Kênh thông báo
CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'app');

-- Trạng thái bài viết
CREATE TYPE article_status AS ENUM ('draft', 'published');


-- =============================================================================
--  SECTION 2 — TABLES (thứ tự: bảng cha → bảng con)
-- =============================================================================

-- -----------------------------------------------------------------------------
--  Bảng 1: users
--  Lưu thông tin tài khoản người dùng (owner, vet, admin).
--  Đây là bảng trung tâm, được tham chiếu bởi hầu hết các bảng khác.
-- -----------------------------------------------------------------------------
CREATE TABLE users (
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name           VARCHAR(100)    NOT NULL,
    email               VARCHAR(255)    NOT NULL UNIQUE,
    password_hash       VARCHAR(255)    NOT NULL,
    phone               VARCHAR(20),
    role                user_role       NOT NULL DEFAULT 'owner',
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    email_verified_at   TIMESTAMPTZ,
    avatar_url          VARCHAR(500),
    last_login_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  users                     IS 'Tài khoản người dùng: chủ thú cưng, bác sĩ, quản trị viên';
COMMENT ON COLUMN users.id                  IS 'UUID, tự sinh';
COMMENT ON COLUMN users.role                IS 'owner | vet | admin';
COMMENT ON COLUMN users.email_verified_at   IS 'NULL = chưa xác minh email';
COMMENT ON COLUMN users.last_login_at       IS 'Thời điểm đăng nhập gần nhất';

CREATE INDEX idx_users_email    ON users (email);
CREATE INDEX idx_users_role     ON users (role);
CREATE INDEX idx_users_active   ON users (is_active);


-- -----------------------------------------------------------------------------
--  Bảng 2: refresh_tokens
--  Lưu refresh token để hỗ trợ logout thật sự và cấp access token mới.
-- -----------------------------------------------------------------------------
CREATE TABLE refresh_tokens (
    id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       TEXT        NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  refresh_tokens            IS 'JWT refresh token — lưu để kiểm soát revoke';
COMMENT ON COLUMN refresh_tokens.revoked    IS 'TRUE = token đã bị thu hồi (logout)';

CREATE INDEX idx_refresh_tokens_user_id     ON refresh_tokens (user_id);
CREATE INDEX idx_refresh_tokens_token       ON refresh_tokens (token);
CREATE INDEX idx_refresh_tokens_expires_at  ON refresh_tokens (expires_at);


-- -----------------------------------------------------------------------------
--  Bảng 3: pets
--  Thông tin thú cưng. Mỗi thú cưng thuộc về một owner.
-- -----------------------------------------------------------------------------
CREATE TABLE pets (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id        UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    species         VARCHAR(50)  NOT NULL,            -- e.g. "Chó", "Mèo", "Chim"
    breed           VARCHAR(100),
    date_of_birth   DATE,
    gender          pet_gender  NOT NULL DEFAULT 'unknown',
    avatar_url      VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  pets              IS 'Thú cưng — mỗi bản ghi thuộc về một owner';
COMMENT ON COLUMN pets.species      IS 'Loài: Chó, Mèo, Hamster, ...';
COMMENT ON COLUMN pets.gender       IS 'male | female | unknown';

CREATE INDEX idx_pets_owner_id  ON pets (owner_id);
CREATE INDEX idx_pets_species   ON pets (species);


-- -----------------------------------------------------------------------------
--  Bảng 4: veterinarians
--  Thông tin chuyên môn của bác sĩ thú y (1-1 với users).
-- -----------------------------------------------------------------------------
CREATE TABLE veterinarians (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID        NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    specialization      VARCHAR(100) NOT NULL,
    bio                 TEXT,
    certificate_url     VARCHAR(500),
    is_active           BOOLEAN     NOT NULL DEFAULT TRUE
);

COMMENT ON TABLE  veterinarians                 IS 'Hồ sơ chuyên môn bác sĩ thú y (1-1 với users)';
COMMENT ON COLUMN veterinarians.specialization  IS 'Chuyên khoa: Nội khoa, Ngoại khoa, Da liễu, ...';
COMMENT ON COLUMN veterinarians.certificate_url IS 'URL chứng chỉ hành nghề';

CREATE INDEX idx_veterinarians_user_id      ON veterinarians (user_id);
CREATE INDEX idx_veterinarians_is_active    ON veterinarians (is_active);


-- -----------------------------------------------------------------------------
--  Bảng 5: services
--  Danh mục dịch vụ phòng khám cung cấp.
-- -----------------------------------------------------------------------------
CREATE TABLE services (
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    name                VARCHAR(100)    NOT NULL,
    description         TEXT,
    price               DECIMAL(10,2)   NOT NULL CHECK (price >= 0),
    duration_minutes    INTEGER         NOT NULL CHECK (duration_minutes > 0),
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE
);

COMMENT ON TABLE  services                      IS 'Danh mục dịch vụ phòng khám';
COMMENT ON COLUMN services.duration_minutes     IS 'Thời gian thực hiện dịch vụ (phút)';
COMMENT ON COLUMN services.price                IS 'Giá niêm yết (VND hoặc đơn vị tiền tệ)';

CREATE INDEX idx_services_is_active ON services (is_active);


-- -----------------------------------------------------------------------------
--  Bảng 6: vet_schedules
--  Lịch làm việc định kỳ (theo ngày trong tuần) của từng bác sĩ.
-- -----------------------------------------------------------------------------
CREATE TABLE vet_schedules (
    id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    vet_id          UUID        NOT NULL REFERENCES veterinarians(id) ON DELETE CASCADE,
    day_of_week     SMALLINT    NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time      TIME        NOT NULL,
    end_time        TIME        NOT NULL,
    is_available    BOOLEAN     NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_schedule_time CHECK (end_time > start_time)
);

COMMENT ON TABLE  vet_schedules                 IS 'Lịch làm việc định kỳ của bác sĩ';
COMMENT ON COLUMN vet_schedules.day_of_week     IS '0=Chủ nhật, 1=Thứ 2, ..., 6=Thứ 7';
COMMENT ON COLUMN vet_schedules.is_available    IS 'FALSE = tạm nghỉ ngày đó';

CREATE INDEX idx_vet_schedules_vet_id           ON vet_schedules (vet_id);
CREATE INDEX idx_vet_schedules_day_of_week      ON vet_schedules (day_of_week);
CREATE INDEX idx_vet_schedules_vet_day          ON vet_schedules (vet_id, day_of_week);


-- -----------------------------------------------------------------------------
--  Bảng 7: appointments
--  Lịch hẹn khám — liên kết owner, pet, vet, service.
-- -----------------------------------------------------------------------------
CREATE TABLE appointments (
    id              UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id        UUID                NOT NULL REFERENCES users(id),
    pet_id          UUID                NOT NULL REFERENCES pets(id),
    vet_id          UUID                NOT NULL REFERENCES veterinarians(id),
    service_id      UUID                NOT NULL REFERENCES services(id),
    scheduled_at    TIMESTAMPTZ         NOT NULL,
    status          appointment_status  NOT NULL DEFAULT 'pending',
    notes           TEXT,
    created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  appointments              IS 'Lịch hẹn khám — trung tâm của hệ thống';
COMMENT ON COLUMN appointments.scheduled_at IS 'Thời gian hẹn khám (có timezone)';
COMMENT ON COLUMN appointments.status       IS 'pending → confirmed → completed | cancelled';

CREATE INDEX idx_appointments_owner_id      ON appointments (owner_id);
CREATE INDEX idx_appointments_pet_id        ON appointments (pet_id);
CREATE INDEX idx_appointments_vet_id        ON appointments (vet_id);
CREATE INDEX idx_appointments_service_id    ON appointments (service_id);
CREATE INDEX idx_appointments_status        ON appointments (status);
CREATE INDEX idx_appointments_scheduled_at  ON appointments (scheduled_at);
-- Index tổng hợp cho query lịch của bác sĩ theo ngày
CREATE INDEX idx_appointments_vet_time      ON appointments (vet_id, scheduled_at);


-- -----------------------------------------------------------------------------
--  Bảng 8: medical_records
--  Hồ sơ y tế — tạo sau mỗi cuộc hẹn completed.
--  Quan hệ 1-1 với appointments.
-- -----------------------------------------------------------------------------
CREATE TABLE medical_records (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id      UUID        NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE RESTRICT,
    pet_id              UUID        NOT NULL REFERENCES pets(id),
    vet_id              UUID        NOT NULL REFERENCES veterinarians(id),
    diagnosis           TEXT        NOT NULL,
    treatment           TEXT        NOT NULL,
    prescription        TEXT,
    notes               TEXT,
    recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  medical_records                   IS 'Hồ sơ y tế sau khám — 1-1 với appointments';
COMMENT ON COLUMN medical_records.appointment_id    IS 'UNIQUE — mỗi lịch hẹn có tối đa 1 hồ sơ';
COMMENT ON COLUMN medical_records.diagnosis         IS 'Chẩn đoán bệnh';
COMMENT ON COLUMN medical_records.prescription      IS 'Đơn thuốc (nullable)';

CREATE INDEX idx_medical_records_pet_id     ON medical_records (pet_id);
CREATE INDEX idx_medical_records_vet_id     ON medical_records (vet_id);
CREATE INDEX idx_medical_records_recorded_at ON medical_records (recorded_at DESC);


-- -----------------------------------------------------------------------------
--  Bảng 9: payments
--  Thông tin thanh toán — 1-1 với appointments.
-- -----------------------------------------------------------------------------
CREATE TABLE payments (
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id      UUID            NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE RESTRICT,
    owner_id            UUID            NOT NULL REFERENCES users(id),
    amount              DECIMAL(10,2)   NOT NULL CHECK (amount >= 0),
    method              payment_method  NOT NULL,
    status              payment_status  NOT NULL DEFAULT 'pending',
    transaction_id      VARCHAR(255),
    paid_at             TIMESTAMPTZ
);

COMMENT ON TABLE  payments                  IS 'Thanh toán — 1-1 với appointments';
COMMENT ON COLUMN payments.transaction_id   IS 'Mã giao dịch từ cổng thanh toán (nullable)';
COMMENT ON COLUMN payments.paid_at          IS 'NULL = chưa thanh toán';

CREATE INDEX idx_payments_appointment_id    ON payments (appointment_id);
CREATE INDEX idx_payments_owner_id          ON payments (owner_id);
CREATE INDEX idx_payments_status            ON payments (status);
CREATE INDEX idx_payments_paid_at           ON payments (paid_at DESC);


-- -----------------------------------------------------------------------------
--  Bảng 10: notifications
--  Thông báo gửi đến người dùng qua nhiều kênh.
-- -----------------------------------------------------------------------------
CREATE TABLE notifications (
    id          UUID                    PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID                    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type        VARCHAR(50)             NOT NULL,       -- e.g. 'appointment_reminder'
    channel     notification_channel   NOT NULL,
    title       VARCHAR(200)            NOT NULL,
    message     TEXT                    NOT NULL,
    is_read     BOOLEAN                 NOT NULL DEFAULT FALSE,
    sent_at     TIMESTAMPTZ             NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  notifications         IS 'Thông báo tới người dùng qua email / SMS / app';
COMMENT ON COLUMN notifications.type    IS 'Loại thông báo: appointment_reminder, payment_success, ...';
COMMENT ON COLUMN notifications.channel IS 'email | sms | app';

CREATE INDEX idx_notifications_user_id  ON notifications (user_id);
CREATE INDEX idx_notifications_is_read  ON notifications (user_id, is_read);
CREATE INDEX idx_notifications_sent_at  ON notifications (sent_at DESC);


-- -----------------------------------------------------------------------------
--  Bảng 11: promotions
--  Mã khuyến mãi / giảm giá.
-- -----------------------------------------------------------------------------
CREATE TABLE promotions (
    id                  UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    code                VARCHAR(50)     NOT NULL UNIQUE,
    description         TEXT,
    discount_percent    DECIMAL(5,2)    NOT NULL CHECK (discount_percent BETWEEN 0 AND 100),
    valid_from          DATE            NOT NULL,
    valid_to            DATE            NOT NULL,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_promotion_dates CHECK (valid_to >= valid_from)
);

COMMENT ON TABLE  promotions                    IS 'Mã khuyến mãi giảm giá dịch vụ';
COMMENT ON COLUMN promotions.discount_percent   IS 'Phần trăm giảm giá (0–100)';
COMMENT ON COLUMN promotions.valid_from         IS 'Ngày bắt đầu hiệu lực';
COMMENT ON COLUMN promotions.valid_to           IS 'Ngày hết hiệu lực';

CREATE INDEX idx_promotions_code        ON promotions (code);
CREATE INDEX idx_promotions_active      ON promotions (is_active);
CREATE INDEX idx_promotions_valid_dates ON promotions (valid_from, valid_to);


-- -----------------------------------------------------------------------------
--  Bảng 12: articles
--  Bài viết / tin tức về chăm sóc thú cưng.
-- -----------------------------------------------------------------------------
CREATE TABLE articles (
    id              UUID            PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id       UUID            NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    title           VARCHAR(255)    NOT NULL,
    content         TEXT            NOT NULL,
    status          article_status  NOT NULL DEFAULT 'draft',
    published_at    TIMESTAMPTZ
);

COMMENT ON TABLE  articles              IS 'Bài viết kiến thức / tin tức chăm sóc thú cưng';
COMMENT ON COLUMN articles.status       IS 'draft | published';
COMMENT ON COLUMN articles.published_at IS 'NULL = chưa xuất bản';

CREATE INDEX idx_articles_author_id     ON articles (author_id);
CREATE INDEX idx_articles_status        ON articles (status);
CREATE INDEX idx_articles_published_at  ON articles (published_at DESC);


-- =============================================================================
--  SECTION 3 — SAMPLE DATA
--  Dữ liệu mẫu để test — password_hash là bcrypt của "Password@1"
-- =============================================================================

-- ─────────────────────────── users ───────────────────────────
INSERT INTO users (id, full_name, email, password_hash, phone, role, is_active, email_verified_at, avatar_url) VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    'Nguyen Van Admin',
    'admin@mypet.dev',
    '$2b$12$KIXp7QsHk.bfmJE68Y1o5OqJ.oIq9Mf7k7gH2z8bLqN5zP1RxW.Oi',
    '0901234567',
    'admin',
    TRUE,
    NOW(),
    NULL
),
(
    'a0000000-0000-0000-0000-000000000002',
    'Tran Thi Lan',
    'lan.owner@mypet.dev',
    '$2b$12$KIXp7QsHk.bfmJE68Y1o5OqJ.oIq9Mf7k7gH2z8bLqN5zP1RxW.Oi',
    '0912345678',
    'owner',
    TRUE,
    NOW(),
    NULL
),
(
    'a0000000-0000-0000-0000-000000000003',
    'Le Van Minh',
    'minh.owner@mypet.dev',
    '$2b$12$KIXp7QsHk.bfmJE68Y1o5OqJ.oIq9Mf7k7gH2z8bLqN5zP1RxW.Oi',
    '0923456789',
    'owner',
    TRUE,
    NOW(),
    NULL
),
(
    'a0000000-0000-0000-0000-000000000004',
    'BS. Pham Thi Hoa',
    'hoa.vet@mypet.dev',
    '$2b$12$KIXp7QsHk.bfmJE68Y1o5OqJ.oIq9Mf7k7gH2z8bLqN5zP1RxW.Oi',
    '0934567890',
    'vet',
    TRUE,
    NOW(),
    NULL
),
(
    'a0000000-0000-0000-0000-000000000005',
    'BS. Nguyen Duc Thanh',
    'thanh.vet@mypet.dev',
    '$2b$12$KIXp7QsHk.bfmJE68Y1o5OqJ.oIq9Mf7k7gH2z8bLqN5zP1RxW.Oi',
    '0945678901',
    'vet',
    TRUE,
    NOW(),
    NULL
);


-- ─────────────────────────── refresh_tokens ───────────────────────────
INSERT INTO refresh_tokens (id, user_id, token, expires_at, revoked) VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'sample-refresh-token-owner-lan-001',
    NOW() + INTERVAL '7 days',
    FALSE
);


-- ─────────────────────────── pets ───────────────────────────
INSERT INTO pets (id, owner_id, name, species, breed, date_of_birth, gender, avatar_url) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'Bông',
    'Chó',
    'Poodle',
    '2022-03-15',
    'female',
    NULL
),
(
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    'Mochi',
    'Mèo',
    'Mèo Ta',
    '2021-07-20',
    'male',
    NULL
),
(
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000003',
    'Max',
    'Chó',
    'Golden Retriever',
    '2020-01-10',
    'male',
    NULL
),
(
    'c0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000003',
    'Luna',
    'Mèo',
    'British Shorthair',
    '2023-05-01',
    'female',
    NULL
);


-- ─────────────────────────── veterinarians ───────────────────────────
INSERT INTO veterinarians (id, user_id, specialization, bio, certificate_url, is_active) VALUES
(
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000004',
    'Nội khoa & Ngoại khoa thú y',
    'Bác sĩ Hoa có hơn 8 năm kinh nghiệm trong lĩnh vực nội ngoại khoa thú y, chuyên điều trị chó và mèo.',
    'https://cdn.mypet.dev/certs/hoa_cert.pdf',
    TRUE
),
(
    'd0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000005',
    'Da liễu & Dinh dưỡng thú y',
    'Bác sĩ Thanh chuyên về các bệnh da liễu và tư vấn dinh dưỡng cho thú cưng.',
    'https://cdn.mypet.dev/certs/thanh_cert.pdf',
    TRUE
);


-- ─────────────────────────── services ───────────────────────────
INSERT INTO services (id, name, description, price, duration_minutes, is_active) VALUES
(
    'e0000000-0000-0000-0000-000000000001',
    'Khám tổng quát',
    'Kiểm tra sức khỏe toàn diện: tim, phổi, da lông, cân nặng',
    150000,
    30,
    TRUE
),
(
    'e0000000-0000-0000-0000-000000000002',
    'Tiêm phòng',
    'Tiêm vaccine định kỳ theo lịch khuyến nghị',
    200000,
    20,
    TRUE
),
(
    'e0000000-0000-0000-0000-000000000003',
    'Tắm & Grooming',
    'Tắm, sấy, cắt tỉa lông và vệ sinh tai móng',
    250000,
    60,
    TRUE
),
(
    'e0000000-0000-0000-0000-000000000004',
    'Xét nghiệm máu',
    'Tổng phân tích tế bào máu và sinh hóa máu cơ bản',
    500000,
    45,
    TRUE
),
(
    'e0000000-0000-0000-0000-000000000005',
    'Siêu âm',
    'Siêu âm ổ bụng chẩn đoán bệnh nội tạng',
    400000,
    40,
    TRUE
);


-- ─────────────────────────── vet_schedules ───────────────────────────
-- BS. Hoa: Thứ 2, 3, 4, 5, 6 (8:00–17:00)
INSERT INTO vet_schedules (id, vet_id, day_of_week, start_time, end_time, is_available) VALUES
('f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 1, '08:00', '17:00', TRUE),
('f0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 2, '08:00', '17:00', TRUE),
('f0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000001', 3, '08:00', '17:00', TRUE),
('f0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 4, '08:00', '17:00', TRUE),
('f0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000001', 5, '08:00', '17:00', TRUE),
-- BS. Thanh: Thứ 2, 4, 6, 7 (9:00–18:00)
('f0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000002', 1, '09:00', '18:00', TRUE),
('f0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000002', 3, '09:00', '18:00', TRUE),
('f0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000002', 5, '09:00', '18:00', TRUE),
('f0000000-0000-0000-0000-000000000009', 'd0000000-0000-0000-0000-000000000002', 6, '09:00', '13:00', TRUE);


-- ─────────────────────────── appointments ───────────────────────────
INSERT INTO appointments (id, owner_id, pet_id, vet_id, service_id, scheduled_at, status, notes) VALUES
(
    'aa000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000001',  -- Bông
    'd0000000-0000-0000-0000-000000000001',  -- BS. Hoa
    'e0000000-0000-0000-0000-000000000001',  -- Khám tổng quát
    '2026-05-22 09:00:00+07',
    'confirmed',
    'Bông bị ho 3 ngày, biếng ăn'
),
(
    'aa000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000002',  -- Mochi
    'd0000000-0000-0000-0000-000000000002',  -- BS. Thanh
    'e0000000-0000-0000-0000-000000000002',  -- Tiêm phòng
    '2026-05-23 10:30:00+07',
    'pending',
    NULL
),
(
    'aa000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000003',  -- Max
    'd0000000-0000-0000-0000-000000000001',  -- BS. Hoa
    'e0000000-0000-0000-0000-000000000004',  -- Xét nghiệm máu
    '2026-05-20 14:00:00+07',
    'completed',
    'Kiểm tra định kỳ 6 tháng'
),
(
    'aa000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000004',  -- Luna
    'd0000000-0000-0000-0000-000000000002',  -- BS. Thanh
    'e0000000-0000-0000-0000-000000000003',  -- Tắm & Grooming
    '2026-05-18 11:00:00+07',
    'completed',
    NULL
),
(
    'aa000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000001',  -- Bông
    'd0000000-0000-0000-0000-000000000001',  -- BS. Hoa
    'e0000000-0000-0000-0000-000000000005',  -- Siêu âm
    '2026-05-10 09:30:00+07',
    'cancelled',
    'Chủ huỷ vì bận công việc'
);


-- ─────────────────────────── medical_records ───────────────────────────
-- Chỉ tạo cho appointment có status = completed
INSERT INTO medical_records (id, appointment_id, pet_id, vet_id, diagnosis, treatment, prescription, notes) VALUES
(
    'bb000000-0000-0000-0000-000000000001',
    'aa000000-0000-0000-0000-000000000003',  -- Max - xét nghiệm máu
    'c0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000001',
    'Sức khỏe tổng thể tốt. Chỉ số hồng cầu hơi thấp.',
    'Bổ sung sắt và vitamin B12 trong 1 tháng',
    'Ferrovet 1 viên/ngày x 30 ngày',
    'Tái khám sau 4 tuần để kiểm tra lại'
),
(
    'bb000000-0000-0000-0000-000000000002',
    'aa000000-0000-0000-0000-000000000004',  -- Luna - grooming
    'c0000000-0000-0000-0000-000000000004',
    'd0000000-0000-0000-0000-000000000002',
    'Mèo khỏe mạnh. Lông bóng mượt sau grooming.',
    'Không cần điều trị',
    NULL,
    'Grooming định kỳ mỗi 6 tuần được khuyến nghị'
);


-- ─────────────────────────── payments ───────────────────────────
INSERT INTO payments (id, appointment_id, owner_id, amount, method, status, transaction_id, paid_at) VALUES
(
    'cc000000-0000-0000-0000-000000000001',
    'aa000000-0000-0000-0000-000000000003',  -- Max - xét nghiệm
    'a0000000-0000-0000-0000-000000000003',
    500000,
    'card',
    'paid',
    'TXN-2026051400001',
    '2026-05-20 14:45:00+07'
),
(
    'cc000000-0000-0000-0000-000000000002',
    'aa000000-0000-0000-0000-000000000004',  -- Luna - grooming
    'a0000000-0000-0000-0000-000000000003',
    250000,
    'cash',
    'paid',
    NULL,
    '2026-05-18 12:00:00+07'
),
(
    'cc000000-0000-0000-0000-000000000003',
    'aa000000-0000-0000-0000-000000000001',  -- Bông - khám tổng quát (sắp tới)
    'a0000000-0000-0000-0000-000000000002',
    150000,
    'online',
    'pending',
    NULL,
    NULL
);


-- ─────────────────────────── notifications ───────────────────────────
INSERT INTO notifications (id, user_id, type, channel, title, message, is_read) VALUES
(
    'dd000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'appointment_reminder',
    'app',
    'Nhắc nhở lịch khám sắp tới',
    'Bạn có lịch khám cho thú cưng "Bông" vào ngày 22/05/2026 lúc 09:00 với BS. Pham Thi Hoa.',
    FALSE
),
(
    'dd000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003',
    'payment_success',
    'email',
    'Thanh toán thành công',
    'Bạn đã thanh toán thành công 500,000 VND cho lịch khám ngày 20/05/2026. Mã giao dịch: TXN-2026051400001',
    TRUE
),
(
    'dd000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000002',
    'appointment_confirmed',
    'sms',
    'Lịch hẹn đã được xác nhận',
    'Lịch hẹn khám cho Bông ngày 22/05 lúc 09:00 đã được xác nhận. Vui lòng đến đúng giờ.',
    FALSE
);


-- ─────────────────────────── promotions ───────────────────────────
INSERT INTO promotions (id, code, description, discount_percent, valid_from, valid_to, is_active) VALUES
(
    'ee000000-0000-0000-0000-000000000001',
    'WELCOME20',
    'Giảm 20% cho khách hàng đăng ký lần đầu',
    20.00,
    '2026-01-01',
    '2026-12-31',
    TRUE
),
(
    'ee000000-0000-0000-0000-000000000002',
    'SUMMER10',
    'Khuyến mãi hè 2026 — giảm 10% tất cả dịch vụ',
    10.00,
    '2026-06-01',
    '2026-08-31',
    TRUE
),
(
    'ee000000-0000-0000-0000-000000000003',
    'VET15',
    'Giảm 15% dịch vụ khám chuyên khoa',
    15.00,
    '2026-05-01',
    '2026-05-31',
    TRUE
),
(
    'ee000000-0000-0000-0000-000000000004',
    'EXPIRED50',
    'Khuyến mãi đã hết hạn (test)',
    50.00,
    '2025-01-01',
    '2025-03-31',
    FALSE
);


-- ─────────────────────────── articles ───────────────────────────
INSERT INTO articles (id, author_id, title, content, status, published_at) VALUES
(
    'ff000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000004',  -- BS. Hoa
    '5 dấu hiệu chó bị bệnh mà chủ nhân thường bỏ qua',
    'Chó là bạn thân thiết của con người, nhưng chúng không thể nói lên những khó chịu của mình. Dưới đây là 5 dấu hiệu quan trọng bạn cần chú ý...

1. Thay đổi thói quen ăn uống đột ngột
2. Uống nước nhiều bất thường
3. Thở khó hoặc ho dai dẳng
4. Thay đổi hành vi, trở nên hung hăng hoặc thu mình
5. Lông bị rụng nhiều hoặc da có vảy

Nếu thấy bất kỳ dấu hiệu nào trên, hãy đưa thú cưng đến gặp bác sĩ thú y sớm nhất có thể.',
    'published',
    '2026-05-01 08:00:00+07'
),
(
    'ff000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000005',  -- BS. Thanh
    'Chế độ dinh dưỡng tối ưu cho mèo trong mùa hè',
    'Mùa hè nóng bức ảnh hưởng không nhỏ đến sức khỏe và khẩu vị của mèo. Bài viết này hướng dẫn cách điều chỉnh chế độ ăn uống phù hợp...

- Tăng lượng nước uống: Dùng máy lọc nước chạy liên tục hoặc đặt nhiều bát nước
- Ưu tiên thức ăn ướt (pate) để bổ sung độ ẩm
- Tránh thức ăn nhiều chất béo vào những ngày nóng nhất
- Chia nhỏ bữa ăn, 3-4 lần/ngày thay vì 2 lần',
    'published',
    '2026-05-10 09:00:00+07'
),
(
    'ff000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000004',  -- BS. Hoa
    'Lịch tiêm phòng cần thiết cho chó từ 0-12 tháng tuổi',
    'Nội dung bài viết đang được soạn thảo...',
    'draft',
    NULL
);


-- =============================================================================
--  SECTION 4 — USEFUL VIEWS (optional, comment out nếu không cần)
-- =============================================================================

-- View: lịch hẹn sắp tới (pending + confirmed)
CREATE OR REPLACE VIEW v_upcoming_appointments AS
SELECT
    a.id,
    a.scheduled_at,
    a.status,
    u_owner.full_name   AS owner_name,
    u_owner.email       AS owner_email,
    p.name              AS pet_name,
    p.species           AS pet_species,
    u_vet.full_name     AS vet_name,
    s.name              AS service_name,
    s.price
FROM appointments a
JOIN users         u_owner ON a.owner_id   = u_owner.id
JOIN pets          p       ON a.pet_id     = p.id
JOIN veterinarians v       ON a.vet_id     = v.id
JOIN users         u_vet   ON v.user_id    = u_vet.id
JOIN services      s       ON a.service_id = s.id
WHERE a.status IN ('pending', 'confirmed')
  AND a.scheduled_at >= NOW()
ORDER BY a.scheduled_at;

COMMENT ON VIEW v_upcoming_appointments IS 'Lịch hẹn sắp tới (pending + confirmed, chưa qua ngày)';


-- View: doanh thu theo tháng
CREATE OR REPLACE VIEW v_monthly_revenue AS
SELECT
    DATE_TRUNC('month', paid_at) AS month,
    COUNT(*)                     AS total_payments,
    SUM(amount)                  AS total_revenue,
    AVG(amount)                  AS avg_payment
FROM payments
WHERE status = 'paid'
GROUP BY DATE_TRUNC('month', paid_at)
ORDER BY month DESC;

COMMENT ON VIEW v_monthly_revenue IS 'Doanh thu gộp theo tháng';
