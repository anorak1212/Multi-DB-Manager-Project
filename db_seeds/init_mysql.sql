CREATE TABLE IF NOT EXISTS products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(300),
    category    VARCHAR(80),
    price       FLOAT        NOT NULL,
    stock       INT          NOT NULL DEFAULT 0,
    sku         VARCHAR(50)
);

INSERT INTO products (name, description, category, price, stock, sku) VALUES
    ('Laptop Pro 15',     'Laptop de alto rendimiento Intel i7, 16GB RAM, 512GB SSD', 'Computadoras',  1299.99, 25, 'LAP-PRO-001'),
    ('Wireless Mouse',    'Mouse inalámbrico ergonómico 2.4GHz, batería 12 meses',    'Periféricos',     29.99, 150,'MOU-WIR-001'),
    ('USB-C Hub 7-in-1',  'Hub USB-C con HDMI 4K, USB 3.0, SD card, PD 100W',       'Accesorios',      49.99, 80, 'HUB-USC-001'),
    ('Monitor 27" 4K',    'Monitor IPS 4K UHD 144Hz, sRGB 99%, FreeSync',            'Monitores',      599.99, 15, 'MON-27K-001'),
    ('Teclado Mecánico',  'Teclado mecánico RGB, switches Blue, TKL compacto',        'Periféricos',     89.99, 60, 'TEC-MEC-001'),
    ('Webcam HD 1080p',   'Webcam 1080p 30fps, micrófono integrado, plug & play',     'Periféricos',     45.99, 90, 'CAM-HD-001');
