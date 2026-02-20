// Импортируем Express
const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');

const app = express();
const port = 3000;

// =========================================
// Middleware
// =========================================

// Парсинг JSON-данных из тела запроса
app.use(express.json());

// Парсинг данных из форм
app.use(express.urlencoded({ extended: true }));

// CORS для фронтенда на React (порт 3001)
app.use(cors({
  origin: "http://localhost:3001",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Собственное middleware для логирования запросов
app.use((req, res, next) => {
    res.on('finish', () => {
        console.log(`[${new Date().toISOString()}] [${req.method}] ${res.statusCode} ${req.path}`);
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
            console.log('Body:', req.body);
        }
    });
    next();
});

// =========================================
// База данных (в памяти) - 10+ товаров
// =========================================

let products = [
    { 
        id: nanoid(6), 
        name: 'Наушники Bose QuietComfort', 
        category: 'Аудио',
        description: 'Беспроводные наушники с активным шумоподавлением, до 20 часов работы, мягкие амбушюры',
        price: 24990, 
        stock: 15,
        rating: 4.8,
        image: '/images/product2.jpg'
    },
    { 
        id: nanoid(6), 
        name: 'Смартфон Samsung Galaxy S24', 
        category: 'Смартфоны',
        description: '6.2-дюймовый Dynamic AMOLED 2X, тройная камера 50 Мп, батарея 4000 мАч, Snapdragon 8 Gen 3',
        price: 89990, 
        stock: 8,
        rating: 4.7,
        image: '/images/product.jpg'
    },
    { 
        id: nanoid(6), 
        name: 'Ноутбук Apple MacBook Pro 14"', 
        category: 'Ноутбуки',
        description: 'Чип M3 Pro, 18 ГБ памяти, 512 ГБ SSD, дисплей Liquid Retina XDR',
        price: 189990, 
        stock: 5,
        rating: 4.9,
        image: '/images/product.jpg'
    },
    { 
        id: nanoid(6), 
        name: 'Планшет iPad Pro 13"', 
        category: 'Планшеты',
        description: 'Экран Ultra Retina XDR, чип M4, 256 ГБ, поддержка Apple Pencil Pro',
        price: 129990, 
        stock: 7,
        rating: 4.8,
        image: '/images/product.jpg'
    },
    { 
        id: nanoid(6), 
        name: 'Умные часы Apple Watch Series 9', 
        category: 'Гаджеты',
        description: 'Дисплей Always-On, чип S9, измерение ЭКГ, кислород в крови',
        price: 34990, 
        stock: 12,
        rating: 4.6,
        image: '/images/product.jpg'
    },
    { 
        id: nanoid(6), 
        name: 'Игровая консоль PlayStation 5', 
        category: 'Игры',
        description: 'SSD 1 ТБ, поддержка 8K, 4K Ultra HD Blu-ray, контроллер DualSense',
        price: 59990, 
        stock: 3,
        rating: 4.9,
        image: '/images/product.jpg'
    },
    { 
        id: nanoid(6), 
        name: 'Кофемашина DeLonghi Magnifica', 
        category: 'Для дома',
        description: 'Автоматическая, 15 бар, встроенная кофемолка, капучинатор',
        price: 54990, 
        stock: 6,
        rating: 4.5,
        image: '/images/product.jpg'
    },
    { 
        id: nanoid(6), 
        name: 'Робот-пылесос Xiaomi S10', 
        category: 'Для дома',
        description: 'Лазерная навигация, влажная уборка, 5200 Па, управление через приложение',
        price: 24990, 
        stock: 9,
        rating: 4.4,
        image: '/images/product.jpg'
    },
    { 
        id: nanoid(6), 
        name: 'Монитор Samsung Odyssey G7', 
        category: 'Компьютеры',
        description: '27", 240 Гц, 1 мс, QLED, изогнутый 1000R, G-Sync',
        price: 54990, 
        stock: 4,
        rating: 4.7,
        image: '/images/product.jpg'
    },
    { 
        id: nanoid(6), 
        name: 'Клавиатура Logitech MX Mechanical', 
        category: 'Компьютеры',
        description: 'Механическая, подсветка, Bluetooth, для Mac и Windows',
        price: 14990, 
        stock: 11,
        rating: 4.6,
        image: '/images/product.jpg'
    }
];

// =========================================
// Функция-помощник для поиска товара
// =========================================
function findProductOr404(id, res) {
    const product = products.find(p => p.id == id);
    if (!product) {
        res.status(404).json({ error: "Товар не найден" });
        return null;
    }
    return product;
}

// =========================================
// Главная страница
// =========================================
app.get('/', (req, res) => {
    res.send(`
        <h1>API интернет-магазина</h1>
        <p>Сервер работает!</p>
        <p>Доступные endpoints:</p>
        <ul>
            <li><strong>GET /api/products</strong> - получить все товары</li>
            <li><strong>GET /api/products/:id</strong> - получить товар по ID</li>
            <li><strong>POST /api/products</strong> - добавить новый товар</li>
            <li><strong>PATCH /api/products/:id</strong> - обновить товар</li>
            <li><strong>DELETE /api/products/:id</strong> - удалить товар</li>
            <li><strong>GET /api/categories</strong> - получить все категории</li>
        </ul>
        <p>Текущие товары в базе: ${products.length}</p>
    `);
});

// =========================================
// API маршруты
// =========================================

// GET все категории
app.get('/api/categories', (req, res) => {
    const categories = [...new Set(products.map(p => p.category))];
    res.json(categories);
});

// GET все товары
app.get('/api/products', (req, res) => {
    const { category, minPrice, maxPrice, inStock } = req.query;
    
    let filteredProducts = [...products];
    
    // Фильтрация по категории
    if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    // Фильтрация по цене
    if (minPrice) {
        filteredProducts = filteredProducts.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice) {
        filteredProducts = filteredProducts.filter(p => p.price <= Number(maxPrice));
    }
    
    // Фильтрация по наличию
    if (inStock === 'true') {
        filteredProducts = filteredProducts.filter(p => p.stock > 0);
    }
    
    res.json({
        count: filteredProducts.length,
        products: filteredProducts
    });
});

// GET товар по ID
app.get('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    const product = findProductOr404(productId, res);
    if (!product) return;
    
    res.json(product);
});

// POST новый товар
app.post('/api/products', (req, res) => {
    const { name, category, description, price, stock, rating, image } = req.body;
    
    // Валидация
    if (!name || !price || !category) {
        return res.status(400).json({ error: 'Название, цена и категория обязательны' });
    }
    
    const newProduct = {
        id: nanoid(6),
        name: name.trim(),
        category: category.trim(),
        description: description?.trim() || '',
        price: Number(price),
        stock: Number(stock) || 0,
        rating: Number(rating) || 0,
        image: image || '/images/product.jpg'
    };
    
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// PATCH обновление товара
app.patch('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    const product = findProductOr404(productId, res);
    if (!product) return;
    
    // Проверка на наличие полей для обновления
    if (Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: "Нет данных для обновления" });
    }
    
    const { name, category, description, price, stock, rating, image } = req.body;
    
    if (name !== undefined) product.name = name.trim();
    if (category !== undefined) product.category = category.trim();
    if (description !== undefined) product.description = description.trim();
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (rating !== undefined) product.rating = Number(rating);
    if (image !== undefined) product.image = image;
    
    res.json(product);
});

// DELETE товар
app.delete('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    
    const exists = products.some(p => p.id === productId);
    if (!exists) return res.status(404).json({ error: "Товар не найден" });
    
    products = products.filter(p => p.id !== productId);
    res.status(204).send();
});

// 404 для всех остальных маршрутов
app.use((req, res) => {
    res.status(404).json({ error: "Маршрут не найден" });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
    console.error("Необработанная ошибка:", err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

// =========================================
// Запуск сервера
// =========================================
app.listen(port, () => {
    console.log('\n' + '='.repeat(50));
    console.log('✅ СЕРВЕР ИНТЕРНЕТ-МАГАЗИНА ЗАПУЩЕН!');
    console.log('='.repeat(50));
    console.log(`📡 Адрес: http://localhost:${port}`);
    console.log('📝 API endpoints:');
    console.log(`   GET    http://localhost:${port}/`);
    console.log(`   GET    http://localhost:${port}/api/products`);
    console.log(`   GET    http://localhost:${port}/api/products/:id`);
    console.log(`   GET    http://localhost:${port}/api/categories`);
    console.log(`   POST   http://localhost:${port}/api/products`);
    console.log(`   PATCH  http://localhost:${port}/api/products/:id`);
    console.log(`   DELETE http://localhost:${port}/api/products/:id`);
    console.log('='.repeat(50));
    console.log('📌 Для тестирования используйте Postman или React');
    console.log('📌 Нажмите Ctrl+C для остановки сервера\n');
});