-- =====================================================
-- AioTec v3 - Base de Datos Profesional
-- Ejecutar: mysql -u root -p < database.sql
-- =====================================================

DROP DATABASE IF EXISTS aiotec_db;
CREATE DATABASE aiotec_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aiotec_db;

-- TABLA: usuarios
CREATE TABLE usuarios (
  codigo_usuario   INT AUTO_INCREMENT PRIMARY KEY,
  nombre           VARCHAR(100)  NOT NULL,
  correo           VARCHAR(150)  NOT NULL UNIQUE,
  contrasena       VARCHAR(255)  NOT NULL,
  fecha_registro   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- TABLA: categorias
CREATE TABLE categorias (
  codigo_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre_categoria VARCHAR(80)   NOT NULL UNIQUE
);

-- TABLA: productos
CREATE TABLE productos (
  codigo_producto  INT AUTO_INCREMENT PRIMARY KEY,
  nombre_producto  VARCHAR(150)   NOT NULL,
  descripcion      TEXT,
  precio           DECIMAL(10,2)  NOT NULL,
  stock            INT            DEFAULT 0,
  emoji            VARCHAR(10)    DEFAULT '📦',
  codigo_categoria INT,
  fecha_registro   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (codigo_categoria) REFERENCES categorias(codigo_categoria) ON DELETE SET NULL
);

-- TABLA: compras
CREATE TABLE compras (
  codigo_compra  INT AUTO_INCREMENT PRIMARY KEY,
  codigo_usuario INT            NOT NULL,
  subtotal       DECIMAL(10,2)  NOT NULL,
  iva            DECIMAL(10,2)  NOT NULL DEFAULT 0,
  total_compra   DECIMAL(10,2)  NOT NULL,
  fecha_compra   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (codigo_usuario) REFERENCES usuarios(codigo_usuario) ON DELETE CASCADE
);

-- TABLA: detalle_compra
CREATE TABLE detalle_compra (
  codigo_detalle  INT AUTO_INCREMENT PRIMARY KEY,
  codigo_compra   INT            NOT NULL,
  codigo_producto INT            NOT NULL,
  cantidad        INT            NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2)  NOT NULL,
  subtotal        DECIMAL(10,2)  NOT NULL,
  FOREIGN KEY (codigo_compra)   REFERENCES compras(codigo_compra)      ON DELETE CASCADE,
  FOREIGN KEY (codigo_producto) REFERENCES productos(codigo_producto)  ON DELETE RESTRICT
);

-- DATOS DE EJEMPLO
INSERT INTO categorias (nombre_categoria) VALUES
  ('Laptops'),('Teléfonos'),('Audio'),('Wearables'),('Monitores'),('Periféricos'),('Tablets');

INSERT INTO productos (nombre_producto, descripcion, precio, stock, emoji, codigo_categoria) VALUES
  ('Laptop ProX 15',  'Intel i7, 16GB RAM, SSD 512GB, 15.6" FHD',          1299.99, 15, '💻', 1),
  ('Smartphone Z9',   '6.7" AMOLED, Snapdragon 8 Gen2, 256GB, 108MP',       799.99, 30, '📱', 2),
  ('Auriculares NC1', 'Cancelación de ruido, 30h batería, BT 5.3',          249.99, 50, '🎧', 3),
  ('Smartwatch GT5',  'GPS, monitor cardíaco, 7 días batería',               349.99, 25, '⌚', 4),
  ('Monitor 4K Pro',  '27" IPS, 4K UHD, 144Hz, HDR400',                     599.99, 10, '🖥️', 5),
  ('Teclado MechRGB', 'Mecánico Cherry MX, RGB personalizable',             129.99, 40, '⌨️', 6),
  ('Mouse Gaming X1', '12000 DPI, 6 botones, RGB, cable braided',            79.99, 60, '🖱️', 6),
  ('Tablet Pro 12',   '12" 2K, 8GB RAM, stylus incluido',                   649.99, 20, '📲', 7);

-- Admin de ejemplo (contraseña: admin123)
INSERT INTO usuarios (nombre, correo, contrasena) VALUES
  ('Admin AioTec','admin@aiotec.ec','$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

SELECT CONCAT('Base de datos creada con ',COUNT(*),' productos.') AS resultado FROM productos;
