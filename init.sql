-- Создаем расширение для UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(10) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'seller', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица товаров
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(10) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL CHECK (price >= 0),
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    image VARCHAR(500),
    created_by VARCHAR(255) REFERENCES users(email),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица refresh токенов
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    user_id VARCHAR(10) REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица корзины
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(10) REFERENCES users(id) ON DELETE CASCADE,
    product_id VARCHAR(10) REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Индексы для производительности
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);

-- Добавляем тестовых пользователей
INSERT INTO users (id, email, first_name, last_name, password_hash, role) VALUES
('admin1', 'admin@techstore.com', 'Admin', 'TechStore', '$2b$10$XOM.rq1BHsQqWqWqWqWqWu', 'admin'),
('seller1', 'seller@techstore.com', 'Seller', 'TechStore', '$2b$10$XOM.rq1BHsQqWqWqWqWqWu', 'seller')
ON CONFLICT (email) DO NOTHING;

-- Добавляем тестовые товары (если таблица пуста)
INSERT INTO products (id, title, category, description, price, stock, rating, image, created_by)
SELECT * FROM (VALUES
    ('p1', 'Наушники Bose QuietComfort Ultra', 'Аудио', 'Беспроводные наушники с активным шумоподавлением', 34990, 15, 4.9, 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7311182222.jpg', 'admin@techstore.com'),
    ('p2', 'Смартфон Samsung Galaxy S24 Ultra', 'Смартфоны', '6.8-дюймовый Dynamic AMOLED 2X, 200 МП камера', 129990, 8, 4.8, 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7326345678.jpg', 'admin@techstore.com'),
    ('p3', 'Ноутбук Apple MacBook Pro 16" M3 Max', 'Ноутбуки', 'Чип M3 Max, 48 ГБ памяти, 1 ТБ SSD', 399990, 3, 5.0, 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7312345678.jpg', 'admin@techstore.com')
) AS v(id, title, category, description, price, stock, rating, image, created_by)
WHERE NOT EXISTS (SELECT 1 FROM products);

-- Таблица заказов
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(10) PRIMARY KEY,
    user_id VARCHAR(10) REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
    total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
    shipping_address TEXT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица элементов заказа
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(10) REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(10) REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_time INTEGER NOT NULL,
    product_title VARCHAR(255),
    product_image VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);