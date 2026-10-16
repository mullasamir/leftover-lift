CREATE TABLE contact_messages (
    id         UUID PRIMARY KEY,
    name       VARCHAR(120)  NOT NULL,
    email      VARCHAR(255)  NOT NULL,
    topic      VARCHAR(20)   NOT NULL,
    message    VARCHAR(2000) NOT NULL,
    handled    BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_contact_topic CHECK (topic IN ('GENERAL', 'BUSINESS', 'PROBLEM', 'FEEDBACK'))
);

CREATE INDEX idx_contact_inbox ON contact_messages (handled, created_at DESC);
