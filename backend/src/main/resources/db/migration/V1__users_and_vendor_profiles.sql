CREATE TABLE users (
    id            UUID PRIMARY KEY,
    full_name     VARCHAR(120) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    role          VARCHAR(20)  NOT NULL,
    phone         VARCHAR(30),
    enabled       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_users_email UNIQUE (email),
    CONSTRAINT ck_users_role CHECK (role IN ('CONSUMER', 'VENDOR', 'DRIVER', 'ADMIN'))
);

CREATE TABLE vendor_profiles (
    id            UUID PRIMARY KEY,
    user_id       UUID         NOT NULL,
    business_name VARCHAR(160) NOT NULL,
    business_type VARCHAR(30)  NOT NULL,
    address       VARCHAR(255) NOT NULL,
    city          VARCHAR(100) NOT NULL,
    state         VARCHAR(100) NOT NULL,
    zip_code      VARCHAR(20)  NOT NULL,
    latitude      DOUBLE PRECISION,
    longitude     DOUBLE PRECISION,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_vendor_profiles_user UNIQUE (user_id),
    CONSTRAINT fk_vendor_profiles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_vendor_profiles_city ON vendor_profiles (city);
