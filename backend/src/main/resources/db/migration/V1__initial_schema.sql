-- Flyway V1: Initial schema for Vesta AI
-- Derived from JPA entities: User, SurplusItem, Claim, Donation, ImpactRecord
-- Author: Dharmendra Singh

-- ─── Users ──────────────────────────────────────────────────────────────────
CREATE TABLE users (
    id             BIGSERIAL PRIMARY KEY,
    username       VARCHAR(255) NOT NULL UNIQUE,
    email          VARCHAR(255) NOT NULL UNIQUE,
    password       VARCHAR(255) NOT NULL,
    role           VARCHAR(20)  NOT NULL CHECK (role IN ('SHOP', 'CUSTOMER', 'FOOD_BANK')),
    business_name  VARCHAR(255),
    address        VARCHAR(255),
    phone          VARCHAR(50)
);

-- ─── Surplus Items ───────────────────────────────────────────────────────────
CREATE TABLE surplus_items (
    id               BIGSERIAL PRIMARY KEY,
    title            VARCHAR(255)   NOT NULL,
    description      VARCHAR(1000),
    image_url        VARCHAR(500),
    original_price   DOUBLE PRECISION NOT NULL,
    discounted_price DOUBLE PRECISION NOT NULL,
    quantity         INTEGER        NOT NULL,
    category         VARCHAR(100),
    dietary_tags     VARCHAR(255),
    shop_id          BIGINT         NOT NULL REFERENCES users(id),
    expires_at       TIMESTAMP      NOT NULL,
    created_at       TIMESTAMP      NOT NULL,
    status           VARCHAR(30)    NOT NULL
                         CHECK (status IN ('AVAILABLE','PARTIALLY_CLAIMED','CLAIMED','DONATED','EXPIRED')),
    co2_saved        DOUBLE PRECISION
);

-- ─── Claims ─────────────────────────────────────────────────────────────────
CREATE TABLE claims (
    id               BIGSERIAL PRIMARY KEY,
    surplus_item_id  BIGINT     NOT NULL REFERENCES surplus_items(id),
    customer_id      BIGINT     NOT NULL REFERENCES users(id),
    quantity_claimed INTEGER    NOT NULL,
    claimed_at       TIMESTAMP  NOT NULL,
    status           VARCHAR(20) NOT NULL
                         CHECK (status IN ('PENDING','CONFIRMED','COLLECTED','CANCELLED'))
);

-- ─── Donations ───────────────────────────────────────────────────────────────
CREATE TABLE donations (
    id               BIGSERIAL PRIMARY KEY,
    surplus_item_id  BIGINT     NOT NULL REFERENCES surplus_items(id),
    food_bank_id     BIGINT     NOT NULL REFERENCES users(id),
    quantity_donated INTEGER    NOT NULL,
    donated_at       TIMESTAMP  NOT NULL,
    notes            VARCHAR(500)
);

-- ─── Impact Records ──────────────────────────────────────────────────────────
CREATE TABLE impact_records (
    id           BIGSERIAL PRIMARY KEY,
    shop_id      BIGINT           NOT NULL REFERENCES users(id),
    co2_saved    DOUBLE PRECISION NOT NULL,
    meals_saved  INTEGER          NOT NULL,
    money_saved  DOUBLE PRECISION NOT NULL,
    date         DATE             NOT NULL
);
