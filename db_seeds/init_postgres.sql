CREATE TABLE IF NOT EXISTS clients (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20)
);

INSERT INTO clients (name, email, phone) VALUES
    ('Alice Johnson',  'alice@example.com',  '+1-555-0101'),
    ('Bob Martinez',   'bob@example.com',    '+1-555-0102'),
    ('Carol Williams', 'carol@example.com',  '+1-555-0103')
ON CONFLICT (email) DO NOTHING;
