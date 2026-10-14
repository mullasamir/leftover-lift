CREATE TABLE reservations (
    id           UUID PRIMARY KEY,
    listing_id   UUID           NOT NULL,
    customer_id  UUID           NOT NULL,
    quantity     INTEGER        NOT NULL,
    unit_price   NUMERIC(10, 2) NOT NULL,
    total_price  NUMERIC(10, 2) NOT NULL,
    pickup_code  VARCHAR(8)     NOT NULL,
    status       VARCHAR(20)    NOT NULL,
    version      BIGINT         NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    collected_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    CONSTRAINT fk_reservations_listing FOREIGN KEY (listing_id) REFERENCES listings (id) ON DELETE CASCADE,
    CONSTRAINT fk_reservations_customer FOREIGN KEY (customer_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_reservations_code UNIQUE (pickup_code),
    CONSTRAINT ck_reservations_status CHECK (status IN ('RESERVED', 'COLLECTED', 'CANCELLED', 'EXPIRED')),
    CONSTRAINT ck_reservations_quantity CHECK (quantity BETWEEN 1 AND 10)
);

-- The database itself stops one person holding the same food twice, even if two requests race.
CREATE UNIQUE INDEX uq_reservations_one_active ON reservations (listing_id, customer_id) WHERE status = 'RESERVED';
CREATE INDEX idx_reservations_customer ON reservations (customer_id, created_at DESC);
CREATE INDEX idx_reservations_listing ON reservations (listing_id, status);
