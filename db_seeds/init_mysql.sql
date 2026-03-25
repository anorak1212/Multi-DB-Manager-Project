CREATE TABLE IF NOT EXISTS products (
    id    INT AUTO_INCREMENT PRIMARY KEY,
    name  VARCHAR(100) NOT NULL,
    price FLOAT        NOT NULL,
    stock INT          NOT NULL DEFAULT 0
);

INSERT INTO products (name, price, stock) VALUES
    ('Laptop Pro 15',   1299.99, 25),
    ('Wireless Mouse',    29.99, 150),
    ('USB-C Hub 7-in-1',  49.99, 80);
