// Импортируем Express
const express = require('express');
const app = express();
const port = 3000;

// =========================================
// Middleware
// =========================================

// Парсинг JSON-данных из тела запроса
app.use(express.json());

// Парсинг данных из форм
app.use(express.urlencoded({ extended: true }));

// Собственное middleware для логирования запросов
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
    next();
});

// =========================================
// База данных (в памяти)
// =========================================

let products = [
    { id: 1, name: 'Наушники Bose QuietComfort', price: 24990 },
    { id: 2, name: 'Смартфон Samsung Galaxy S24', price: 89990 },
    { id: 3, name: 'Ноутбук Apple MacBook Pro', price: 189990 },
    { id: 4, name: 'Планшет iPad Pro', price: 79990 },
    { id: 5, name: 'Умные часы Apple Watch', price: 34990 }
];

// =========================================
// Главная страница
// =========================================
app.get('/', (req, res) => {
    res.send(`
        <h1>API управления товарами</h1>
        <p>Сервер работает!</p>
        <p>Доступные endpoints:</p>
        <ul>
            <li><strong>GET /products</strong> - получить все товары</li>
            <li><strong>GET /products/:id</strong> - получить товар по ID</li>
            <li><strong>POST /products</strong> - добавить новый товар</li>
            <li><strong>PATCH /products/:id</strong> - обновить товар</li>
            <li><strong>DELETE /products/:id</strong> - удалить товар</li>
        </ul>
        <p>Текущие товары в базе: ${products.length}</p>
    `);
});

// =========================================
// CRUD операции
// =========================================

// GET все товары
app.get('/products', (req, res) => {
    res.json({
        count: products.length,
        products: products
    });
});

// GET товар по ID
app.get('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
    }
    
    res.json(product);
});

// POST новый товар
app.post('/products', (req, res) => {
    const { name, price } = req.body;
    
    // Простая валидация
    if (!name || !price) {
        return res.status(400).json({ error: 'Название и цена обязательны' });
    }
    
    const newProduct = {
        id: products.length + 1,
        name: name,
        price: Number(price)
    };
    
    products.push(newProduct);
    res.status(201).json(newProduct);
});

// PATCH обновление товара
app.patch('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        return res.status(404).json({ error: 'Товар не найден' });
    }
    
    const { name, price } = req.body;
    
    if (name) product.name = name;
    if (price) product.price = Number(price);
    
    res.json(product);
});

// DELETE товар
app.delete('/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
        return res.status(404).json({ error: 'Товар не найден' });
    }
    
    products.splice(productIndex, 1);
    res.json({ message: 'Товар удален' });
});

// =========================================
// Запуск сервера
// =========================================
app.listen(port, () => {
    console.log('\n' + '='.repeat(50));
    console.log('✅ СЕРВЕР УСПЕШНО ЗАПУЩЕН!');
    console.log('='.repeat(50));
    console.log(`📡 Адрес: http://localhost:${port}`);
    console.log('📝 Доступные endpoints:');
    console.log(`   GET    http://localhost:${port}/`);
    console.log(`   GET    http://localhost:${port}/products`);
    console.log(`   GET    http://localhost:${port}/products/1`);
    console.log(`   POST   http://localhost:${port}/products`);
    console.log(`   PATCH  http://localhost:${port}/products/1`);
    console.log(`   DELETE http://localhost:${port}/products/1`);
    console.log('='.repeat(50));
    console.log('📌 Для тестирования используйте Postman или curl');
    console.log('📌 Нажмите Ctrl+C для остановки сервера\n');
});