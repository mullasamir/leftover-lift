CREATE TABLE listings (
    id                 UUID PRIMARY KEY,
    vendor_id          UUID           NOT NULL,
    title              VARCHAR(120)   NOT NULL,
    description        VARCHAR(1000)  NOT NULL,
    category           VARCHAR(20)    NOT NULL,
    dietary_tags       VARCHAR(255)   NOT NULL DEFAULT '',
    original_price     NUMERIC(10, 2) NOT NULL,
    rescue_price       NUMERIC(10, 2) NOT NULL,
    discount_percent   INTEGER        NOT NULL,
    quantity_total     INTEGER        NOT NULL,
    quantity_remaining INTEGER        NOT NULL,
    pickup_start       TIMESTAMPTZ    NOT NULL,
    pickup_end         TIMESTAMPTZ    NOT NULL,
    status             VARCHAR(20)    NOT NULL,
    version            BIGINT         NOT NULL DEFAULT 0,
    created_at         TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_listings_vendor FOREIGN KEY (vendor_id) REFERENCES vendor_profiles (id) ON DELETE CASCADE,
    CONSTRAINT ck_listings_category CHECK (category IN ('BAKERY', 'MEALS', 'CAFE', 'GROCERY')),
    CONSTRAINT ck_listings_status CHECK (status IN ('AVAILABLE', 'SOLD_OUT', 'EXPIRED', 'CANCELLED')),
    CONSTRAINT ck_listings_prices CHECK (original_price > 0 AND rescue_price >= 0 AND rescue_price < original_price),
    CONSTRAINT ck_listings_discount CHECK (discount_percent BETWEEN 0 AND 100),
    CONSTRAINT ck_listings_quantity CHECK (quantity_total > 0 AND quantity_remaining >= 0 AND quantity_remaining <= quantity_total),
    CONSTRAINT ck_listings_window CHECK (pickup_end > pickup_start)
);

CREATE INDEX idx_listings_vendor ON listings (vendor_id);
CREATE INDEX idx_listings_browse ON listings (status, pickup_end);
CREATE INDEX idx_listings_category ON listings (category);
