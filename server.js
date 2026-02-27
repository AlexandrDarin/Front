// Импортируем Express
const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');

// Подключаем Swagger
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

// =========================================
// Middleware
// =========================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS для фронтенда на React
app.use(cors({
  origin: "http://localhost:3001",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Логирование запросов
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
// Swagger Configuration
// =========================================

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - category
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор товара (генерируется автоматически)
 *           example: "abc123"
 *         name:
 *           type: string
 *           description: Название товара
 *           example: "Наушники Bose QuietComfort Ultra"
 *         category:
 *           type: string
 *           description: Категория товара
 *           example: "Аудио"
 *         description:
 *           type: string
 *           description: Описание товара
 *           example: "Беспроводные наушники с активным шумоподавлением"
 *         price:
 *           type: number
 *           description: Цена товара в рублях
 *           example: 34990
 *         stock:
 *           type: integer
 *           description: Количество на складе
 *           example: 15
 *         rating:
 *           type: number
 *           description: Рейтинг товара (0-5)
 *           example: 4.9
 *         image:
 *           type: string
 *           description: URL изображения товара
 *           example: "https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7311182222.jpg"
 *     
 *     Category:
 *       type: string
 *       description: Категория товара
 *       example: "Аудио"
 *     
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Сообщение об ошибке
 *           example: "Товар не найден"
 */

/**
 * @swagger
 * tags:
 *   - name: Products
 *     description: Управление товарами
 *   - name: Categories
 *     description: Получение категорий
 */

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TechStore API - Интернет-магазин электроники',
            version: '1.0.0',
            description: 'API для управления товарами в премиальном интернет-магазине электроники',
            contact: {
                name: 'TechStore Support',
                email: 'support@techstore.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Локальный сервер разработки'
            },
            {
                url: 'https://api.techstore.com',
                description: 'Production сервер'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./server.js'], // Путь к файлу с аннотациями
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Подключаем Swagger UI по адресу /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'TechStore API Documentation',
    customfavIcon: 'https://techstore.com/favicon.ico'
}));

// =========================================
// База данных с реальными изображениями
// =========================================

let products = [
    { 
        id: nanoid(6), 
        name: 'Наушники Bose QuietComfort Ultra', 
        category: 'Аудио',
        description: 'Беспроводные наушники с активным шумоподавлением, технология Immersive Audio, до 24 часов работы, зарядка USB-C',
        price: 34990, 
        stock: 15,
        rating: 4.9,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7311182222.jpg'
    },
    { 
        id: nanoid(6), 
        name: 'Смартфон Samsung Galaxy S24 Ultra', 
        category: 'Смартфоны',
        description: '6.8-дюймовый Dynamic AMOLED 2X, 200 МП камера, S Pen в комплекте, Snapdragon 8 Gen 3, 12 ГБ RAM',
        price: 129990, 
        stock: 8,
        rating: 4.8,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7326345678.jpg'
    },
    { 
        id: nanoid(6), 
        name: 'Ноутбук Apple MacBook Pro 16" M3 Max', 
        category: 'Ноутбуки',
        description: 'Чип M3 Max с 16-ядерным CPU, 40-ядерный GPU, 48 ГБ памяти, 1 ТБ SSD, дисплей Liquid Retina XDR',
        price: 399990, 
        stock: 3,
        rating: 5.0,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7312345678.jpg'
    },
    { 
        id: nanoid(6), 
        name: 'Планшет iPad Pro 13" M4', 
        category: 'Планшеты',
        description: 'Экран Ultra Retina XDR, чип M4, 512 ГБ, поддержка Apple Pencil Pro, 5G',
        price: 159990, 
        stock: 7,
        rating: 4.9,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7323456789.jpg'
    },
    { 
        id: nanoid(6), 
        name: 'Умные часы Apple Watch Ultra 2', 
        category: 'Гаджеты',
        description: 'Дисплей 3000 нит, чип S9, корпус из титана, водонепроницаемость 100 м, измерение ЭКГ и кислорода',
        price: 89990, 
        stock: 12,
        rating: 4.9,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7314567890.jpg'
    },
    { 
        id: nanoid(6), 
        name: 'Игровая консоль PlayStation 5 Slim', 
        category: 'Игры',
        description: 'SSD 1 ТБ, поддержка 8K, 4K Ultra HD Blu-ray, контроллер DualSense, новая ревизия',
        price: 54990, 
        stock: 5,
        rating: 4.9,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7325678901.jpg'
    },
    { 
        id: nanoid(6), 
        name: 'Кофемашина DeLonghi PrimaDonna Soul', 
        category: 'Для дома',
        description: 'Полностью автоматическая, 19 бар, встроенная кофемолка, капучинатор, сенсорный экран',
        price: 159990, 
        stock: 4,
        rating: 4.8,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7336789012.jpg'
    },
    { 
        id: nanoid(6), 
        name: 'Робот-пылесос Dreame L20 Ultra', 
        category: 'Для дома',
        description: 'Лазерная навигация, влажная уборка с подогревом воды, самоочистка, 7000 Па, сушка',
        price: 89990, 
        stock: 6,
        rating: 4.8,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7317890123.jpg'
    },
    { 
        id: nanoid(6), 
        name: 'Монитор Samsung Odyssey OLED G9', 
        category: 'Компьютеры',
        description: '49" изогнутый OLED, 240 Гц, 0.03 мс, Dual QHD, G-Sync, HDR True Black 400',
        price: 219990, 
        stock: 2,
        rating: 5.0,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7328901234.jpg'
    },
    { 
        id: nanoid(6), 
        name: 'Клавиатура Logitech MX Mechanical Mini', 
        category: 'Компьютеры',
        description: 'Механическая, низкопрофильные переключатели, подсветка, Bluetooth, для Mac и Windows',
        price: 15990, 
        stock: 11,
        rating: 4.7,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7339012345.jpg'
    }
];

// =========================================
// Функция-помощник
// =========================================

/**
 * Находит товар по ID или возвращает 404
 * @param {string} id - ID товара
 * @param {Object} res - Response объект Express
 * @returns {Object|null} Найденный товар или null
 */
function findProductOr404(id, res) {
    const product = products.find(p => p.id == id);
    if (!product) {
        res.status(404).json({ error: "Товар не найден" });
        return null;
    }
    return product;
}

// =========================================
// API маршруты
// =========================================

/**
 * @swagger
 * /:
 *   get:
 *     summary: Главная страница API
 *     tags: [Info]
 *     responses:
 *       200:
 *         description: Информация о сервере
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 *               example: "<h1>🛍️ TechStore API</h1>"
 */
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>TechStore API</title>
            <style>
                body { font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px; }
                h1 { color: #4361ee; }
                ul { list-style: none; padding: 0; }
                li { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; }
                a { color: #4361ee; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <h1>🛍️ TechStore API</h1>
            <p>Сервер работает! Товаров в базе: ${products.length}</p>
            <p>📚 <a href="/api-docs">Перейти к Swagger документации</a></p>
            <h2>Доступные endpoints:</h2>
            <ul>
                <li><strong>GET</strong> <a href="/api/products">/api/products</a> - все товары</li>
                <li><strong>GET</strong> /api/products/:id - товар по ID</li>
                <li><strong>POST</strong> /api/products - добавить товар</li>
                <li><strong>PATCH</strong> /api/products/:id - обновить товар</li>
                <li><strong>DELETE</strong> /api/products/:id - удалить товар</li>
                <li><strong>GET</strong> <a href="/api/categories">/api/categories</a> - все категории</li>
            </ul>
        </body>
        </html>
    `);
});

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Возвращает список всех категорий товаров
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Список уникальных категорий
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *             example: ["Аудио", "Смартфоны", "Ноутбуки", "Планшеты", "Гаджеты", "Игры", "Для дома", "Компьютеры"]
 */
app.get('/api/categories', (req, res) => {
    const categories = [...new Set(products.map(p => p.category))];
    res.json(categories);
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список всех товаров с возможностью фильтрации
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Фильтр по категории
 *         example: "Аудио"
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Фильтр "только в наличии"
 *         example: "true"
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Количество найденных товаров
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *             example:
 *               count: 10
 *               products: [
 *                 {
 *                   id: "abc123",
 *                   name: "Наушники Bose QuietComfort Ultra",
 *                   category: "Аудио",
 *                   price: 34990,
 *                   stock: 15
 *                 }
 *               ]
 */
app.get('/api/products', (req, res) => {
    const { category, inStock } = req.query;
    
    let filteredProducts = [...products];
    
    if (category) {
        filteredProducts = filteredProducts.filter(p => p.category === category);
    }
    
    if (inStock === 'true') {
        filteredProducts = filteredProducts.filter(p => p.stock > 0);
    }
    
    res.json({
        count: filteredProducts.length,
        products: filteredProducts
    });
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Уникальный идентификатор товара
 *         example: "abc123"
 *     responses:
 *       200:
 *         description: Детальная информация о товаре
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Товар не найден"
 */
app.get('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    const product = findProductOr404(productId, res);
    if (!product) return;
    res.json(product);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *                 description: Название товара
 *                 example: "Новая модель iPhone 16"
 *               category:
 *                 type: string
 *                 description: Категория товара
 *                 example: "Смартфоны"
 *               description:
 *                 type: string
 *                 description: Описание товара
 *                 example: "Флагманский смартфон с новейшими технологиями"
 *               price:
 *                 type: number
 *                 description: Цена в рублях
 *                 example: 149990
 *               stock:
 *                 type: integer
 *                 description: Количество на складе
 *                 example: 10
 *               rating:
 *                 type: number
 *                 description: Рейтинг (0-5)
 *                 example: 4.8
 *               image:
 *                 type: string
 *                 description: URL изображения
 *                 example: "https://example.com/image.jpg"
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Название, цена и категория обязательны"
 */
app.post('/api/products', (req, res) => {
    const { name, category, description, price, stock, rating, image } = req.body;
    
    if (!name || !price || !category) {
        return res.status(400).json({ error: 'Название, цена и категория обязательны' });
    }
    
    const newProduct = {
        id: nanoid(6),
        name: name.trim(),
        category: category.trim(),
        description: description?.trim() || 'Премиальное качество',
        price: Number(price),
        stock: Number(stock) || 0,
        rating: Number(rating) || 0,
        image: image || 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7311182222.jpg'
    };
    
    products.push(newProduct);
    res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Обновить существующий товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара для обновления
 *         example: "abc123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Новое название
 *                 example: "iPhone 16 Pro Max"
 *               category:
 *                 type: string
 *                 description: Новая категория
 *                 example: "Смартфоны"
 *               description:
 *                 type: string
 *                 description: Новое описание
 *                 example: "Обновленная версия с улучшенной камерой"
 *               price:
 *                 type: number
 *                 description: Новая цена
 *                 example: 179990
 *               stock:
 *                 type: integer
 *                 description: Новое количество
 *                 example: 5
 *               rating:
 *                 type: number
 *                 description: Новый рейтинг
 *                 example: 4.9
 *               image:
 *                 type: string
 *                 description: Новый URL изображения
 *                 example: "https://example.com/new-image.jpg"
 *     responses:
 *       200:
 *         description: Обновленный товар
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Нет данных для обновления
 *       404:
 *         description: Товар не найден
 */
app.patch('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    const product = findProductOr404(productId, res);
    if (!product) return;
    
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

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара для удаления
 *         example: "abc123"
 *     responses:
 *       204:
 *         description: Товар успешно удален (нет содержимого)
 *       404:
 *         description: Товар не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Товар не найден"
 */
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
    console.log('\n' + '='.repeat(60));
    console.log('✅ TECHSTORE API ЗАПУЩЕН!');
    console.log('='.repeat(60));
    console.log(`📡 Адрес: http://localhost:${port}`);
    console.log(`📚 Swagger UI: http://localhost:${port}/api-docs`);
    console.log(`📦 Товаров в базе: ${products.length}`);
    console.log('📝 Категории:', [...new Set(products.map(p => p.category))].join(', '));
    console.log('='.repeat(60));
});