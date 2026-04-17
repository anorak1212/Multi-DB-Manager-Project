CREATE TABLE IF NOT EXISTS clients (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    phone      VARCHAR(20),
    address    VARCHAR(200),
    city       VARCHAR(100),
    country    VARCHAR(100) DEFAULT 'México',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchases (
    id           SERIAL PRIMARY KEY,
    client_id    INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    product_id   INTEGER NOT NULL,
    product_name VARCHAR(100),
    quantity     INTEGER DEFAULT 1,
    unit_price   FLOAT NOT NULL,
    total_price  FLOAT NOT NULL,
    purchased_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO clients (name, email, phone, address, city, country) VALUES
    ('Alice Johnson',  'alice@example.com',  '+1-555-0101', '123 Maple St',    'New York',  'USA'),
    ('Bob Martinez',   'bob@example.com',    '+1-555-0102', '456 Oak Ave',     'Los Angeles','USA'),
    ('Carol Williams', 'carol@example.com',  '+1-555-0103', '789 Pine Rd',     'Chicago',   'USA')
ON CONFLICT (email) DO NOTHING;
