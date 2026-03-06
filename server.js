// Импортируем зависимости
const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Подключаем Swagger
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

// =========================================
// Константы
// =========================================
const JWT_SECRET = "techstore_super_secret_key_2026";
const ACCESS_EXPIRES_IN = "15m";
const SALT_ROUNDS = 10;

// =========================================
// Middleware
// =========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS для фронтенда на React
app.use(cors({
  origin: "http://localhost:3001",
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
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
// Базы данных
// =========================================
let users = [
    {
        id: nanoid(6),
        email: 'admin@techstore.com',
        first_name: 'Admin',
        last_name: 'TechStore',
        passwordHash: '$2b$10$XOM.rq1BHsQqWqWqWqWqWu', // password: admin123
        created_at: new Date().toISOString()
    }
];

let products = [
    { 
        id: nanoid(6), 
        title: 'Наушники Bose QuietComfort Ultra', 
        category: 'Аудио',
        description: 'Беспроводные наушники с активным шумоподавлением, технология Immersive Audio, до 24 часов работы',
        price: 34990, 
        stock: 15,
        rating: 4.9,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7311182222.jpg'
    },
    { 
        id: nanoid(6), 
        title: 'Смартфон Samsung Galaxy S24 Ultra', 
        category: 'Смартфоны',
        description: '6.8-дюймовый Dynamic AMOLED 2X, 200 МП камера, S Pen в комплекте, Snapdragon 8 Gen 3',
        price: 129990, 
        stock: 8,
        rating: 4.8,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7326345678.jpg'
    },
    { 
        id: nanoid(6), 
        title: 'Ноутбук Apple MacBook Pro 16" M3 Max', 
        category: 'Ноутбуки',
        description: 'Чип M3 Max с 16-ядерным CPU, 40-ядерный GPU, 48 ГБ памяти, 1 ТБ SSD',
        price: 399990, 
        stock: 3,
        rating: 5.0,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7312345678.jpg'
    },
    { 
        id: nanoid(6), 
        title: 'Планшет iPad Pro 13" M4', 
        category: 'Планшеты',
        description: 'Экран Ultra Retina XDR, чип M4, 512 ГБ, поддержка Apple Pencil Pro, 5G',
        price: 159990, 
        stock: 7,
        rating: 4.9,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7323456789.jpg'
    },
    { 
        id: nanoid(6), 
        title: 'Умные часы Apple Watch Ultra 2', 
        category: 'Гаджеты',
        description: 'Дисплей 3000 нит, чип S9, корпус из титана, водонепроницаемость 100 м',
        price: 89990, 
        stock: 12,
        rating: 4.9,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7314567890.jpg'
    },
    { 
        id: nanoid(6), 
        title: 'Игровая консоль PlayStation 5 Slim', 
        category: 'Игры',
        description: 'SSD 1 ТБ, поддержка 8K, 4K Ultra HD Blu-ray, контроллер DualSense',
        price: 54990, 
        stock: 5,
        rating: 4.9,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7325678901.jpg'
    },
    { 
        id: nanoid(6), 
        title: 'Кофемашина DeLonghi PrimaDonna Soul', 
        category: 'Для дома',
        description: 'Полностью автоматическая, 19 бар, встроенная кофемолка, капучинатор',
        price: 159990, 
        stock: 4,
        rating: 4.8,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7336789012.jpg'
    },
    { 
        id: nanoid(6), 
        title: 'Робот-пылесос Dreame L20 Ultra', 
        category: 'Для дома',
        description: 'Лазерная навигация, влажная уборка с подогревом, самоочистка, 7000 Па',
        price: 89990, 
        stock: 6,
        rating: 4.8,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7317890123.jpg'
    },
    { 
        id: nanoid(6), 
        title: 'Монитор Samsung Odyssey OLED G9', 
        category: 'Компьютеры',
        description: '49" изогнутый OLED, 240 Гц, 0.03 мс, Dual QHD, G-Sync',
        price: 219990, 
        stock: 2,
        rating: 5.0,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7328901234.jpg'
    },
    { 
        id: nanoid(6), 
        title: 'Клавиатура Logitech MX Mechanical Mini', 
        category: 'Компьютеры',
        description: 'Механическая, низкопрофильные переключатели, подсветка, Bluetooth',
        price: 15990, 
        stock: 11,
        rating: 4.7,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7339012345.jpg'
    }
];

// =========================================
// Swagger Configuration
// =========================================

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - first_name
 *         - last_name
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: Уникальный идентификатор пользователя
 *         email:
 *           type: string
 *           format: email
 *           description: Email пользователя (логин)
 *         first_name:
 *           type: string
 *           description: Имя пользователя
 *         last_name:
 *           type: string
 *           description: Фамилия пользователя
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Дата регистрации
 *       example:
 *         id: "abc123"
 *         email: "user@example.com"
 *         first_name: "Иван"
 *         last_name: "Петров"
 *         created_at: "2026-03-06T12:00:00Z"
 *     
 *     UserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         email:
 *           type: string
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         created_at:
 *           type: string
 *     
 *     LoginResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           description: JWT токен для доступа к защищенным маршрутам
 *         user:
 *           $ref: '#/components/schemas/UserResponse'
 *     
 *     Product:
 *       type: object
 *       required:
 *         - title
 *         - price
 *         - category
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         category:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: number
 *         stock:
 *           type: integer
 *         rating:
 *           type: number
 *         image:
 *           type: string
 *     
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *     
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * 
 * tags:
 *   - name: Auth
 *     description: Аутентификация и управление пользователями
 *   - name: Products
 *     description: Управление товарами
 *   - name: Categories
 *     description: Получение категорий
 */

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TechStore API - С аутентификацией и JWT',
            version: '2.0.0',
            description: 'API интернет-магазина с полной системой аутентификации и JWT токенами',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Локальный сервер'
            }
        ],
    },
    apis: ['./server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'TechStore API Documentation'
}));

// =========================================
// Вспомогательные функции
// =========================================

/**
 * Хеширование пароля с помощью bcrypt
 */
async function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Проверка пароля
 */
async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}

/**
 * Поиск пользователя по email
 */
function findUserByEmail(email, res) {
    const user = users.find(u => u.email === email);
    if (!user) {
        res?.status(404).json({ error: "Пользователь не найден" });
        return null;
    }
    return user;
}

/**
 * Поиск пользователя по ID
 */
function findUserById(id, res) {
    const user = users.find(u => u.id === id);
    if (!user) {
        res?.status(404).json({ error: "Пользователь не найден" });
        return null;
    }
    return user;
}

/**
 * Поиск товара по ID
 */
function findProductOr404(id, res) {
    const product = products.find(p => p.id == id);
    if (!product) {
        res.status(404).json({ error: "Товар не найден" });
        return null;
    }
    return product;
}

/**
 * Middleware для проверки JWT токена
 */
function authMiddleware(req, res, next) {
    const header = req.headers.authorization || "";

    // Ожидаем формат: Bearer <token>
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            error: "Отсутствует или неверный Authorization header"
        });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        
        // Сохраняем данные токена в req
        req.user = payload; // { sub, email, first_name, last_name, iat, exp }
        
        next();
    } catch (err) {
        return res.status(401).json({
            error: "Недействительный или просроченный токен"
        });
    }
}

// =========================================
// Публичные маршруты (Auth)
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
 */
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>TechStore API with Auth</title>
            <style>
                body { font-family: Arial; max-width: 800px; margin: 50px auto; padding: 20px; }
                h1 { color: #4361ee; }
                .stats { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; }
                ul { list-style: none; padding: 0; }
                li { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; }
                a { color: #4361ee; text-decoration: none; }
                a:hover { text-decoration: underline; }
                .badge { background: #4361ee; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px; }
            </style>
        </head>
        <body>
            <h1>🛍️ TechStore API с аутентификацией</h1>
            <div class="stats">
                <p>👥 Пользователей: ${users.length}</p>
                <p>📦 Товаров: ${products.length}</p>
                <p>🔐 JWT Secret: ${JWT_SECRET.substring(0, 10)}...</p>
            </div>
            <p>📚 <a href="/api-docs">Swagger документация</a> <span class="badge">OpenAPI 3.0</span></p>
            <h2>Доступные endpoints:</h2>
            <h3>🔓 Публичные:</h3>
            <ul>
                <li><strong>POST</strong> /api/auth/register - регистрация</li>
                <li><strong>POST</strong> /api/auth/login - вход (получение токена)</li>
                <li><strong>GET</strong> /api/products - все товары (публично)</li>
                <li><strong>GET</strong> /api/categories - все категории (публично)</li>
            </ul>
            <h3>🔒 Защищенные (требуют Bearer токен):</h3>
            <ul>
                <li><strong>GET</strong> /api/auth/me - информация о текущем пользователе</li>
                <li><strong>POST</strong> /api/products - создать товар</li>
                <li><strong>GET</strong> /api/products/:id - товар по ID</li>
                <li><strong>PUT</strong> /api/products/:id - полностью обновить товар</li>
                <li><strong>DELETE</strong> /api/products/:id - удалить товар</li>
            </ul>
        </body>
        </html>
    `);
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - first_name
 *               - last_name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ivan@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "qwerty123"
 *               first_name:
 *                 type: string
 *                 example: "Иван"
 *               last_name:
 *                 type: string
 *                 example: "Петров"
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Ошибка валидации
 *       409:
 *         description: Email уже используется
 */
app.post("/api/auth/register", async (req, res) => {
    const { email, password, first_name, last_name } = req.body;

    // Валидация
    if (!email || !password || !first_name || !last_name) {
        return res.status(400).json({ 
            error: "Все поля обязательны: email, password, first_name, last_name" 
        });
    }

    // Проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Неверный формат email" });
    }

    // Проверка длины пароля
    if (password.length < 6) {
        return res.status(400).json({ error: "Пароль должен быть минимум 6 символов" });
    }

    // Проверка уникальности email
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(409).json({ error: "Пользователь с таким email уже существует" });
    }

    // Хеширование пароля
    const passwordHash = await hashPassword(password);

    // Создание пользователя
    const newUser = {
        id: nanoid(6),
        email,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        passwordHash,
        created_at: new Date().toISOString()
    };

    users.push(newUser);

    // Не возвращаем passwordHash
    res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        created_at: newUser.created_at
    });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему (получение JWT токена)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "ivan@example.com"
 *               password:
 *                 type: string
 *                 example: "qwerty123"
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Отсутствуют обязательные поля
 *       401:
 *         description: Неверные учетные данные
 */
app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email и пароль обязательны" });
    }

    const user = findUserByEmail(email);
    if (!user) {
        return res.status(401).json({ error: "Неверные учетные данные" });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
        return res.status(401).json({ error: "Неверные учетные данные" });
    }

    // Создание JWT токена
    const accessToken = jwt.sign(
        {
            sub: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name
        },
        JWT_SECRET,
        {
            expiresIn: ACCESS_EXPIRES_IN
        }
    );

    res.json({
        accessToken,
        user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name
        }
    });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получение информации о текущем пользователе
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные пользователя
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Не авторизован
 */
app.get("/api/auth/me", authMiddleware, (req, res) => {
    const userId = req.user.sub;
    const user = findUserById(userId, res);
    if (!user) return;

    res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        created_at: user.created_at
    });
});

// =========================================
// Публичные маршруты (Products - только GET)
// =========================================

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Получить все категории
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Список категорий
 */
app.get('/api/categories', (req, res) => {
    const categories = [...new Set(products.map(p => p.category))];
    res.json(categories);
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить все товары (публично)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: inStock
 *         schema:
 *           type: string
 *           enum: [true, false]
 *     responses:
 *       200:
 *         description: Список товаров
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
        products: filteredProducts.map(p => ({
            id: p.id,
            title: p.title,
            category: p.category,
            description: p.description,
            price: p.price,
            stock: p.stock,
            rating: p.rating,
            image: p.image
        }))
    });
});

// =========================================
// Защищенные маршруты (требуют аутентификации)
// =========================================

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар (только для авторизованных)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               rating:
 *                 type: number
 *               image:
 *                 type: string
 *     responses:
 *       201:
 *         description: Товар создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Не авторизован
 */
app.post('/api/products', authMiddleware, (req, res) => {
    const { title, category, description, price, stock, rating, image } = req.body;
    
    if (!title || !price || !category) {
        return res.status(400).json({ error: 'Название, цена и категория обязательны' });
    }
    
    const newProduct = {
        id: nanoid(6),
        title: title.trim(),
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
 *   get:
 *     summary: Получить товар по ID (требует авторизации)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Детальная информация о товаре
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Товар не найден
 */
app.get('/api/products/:id', authMiddleware, (req, res) => {
    const productId = req.params.id;
    const product = findProductOr404(productId, res);
    if (!product) return;
    res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Полностью обновить товар (требует авторизации)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Обновленный товар
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Товар не найден
 */
app.put('/api/products/:id', authMiddleware, (req, res) => {
    const productId = req.params.id;
    const product = findProductOr404(productId, res);
    if (!product) return;
    
    const { title, category, description, price, stock, rating, image } = req.body;
    
    // PUT требует все поля
    if (!title || !category || !price) {
        return res.status(400).json({ error: "Все поля обязательны для PUT запроса" });
    }
    
    product.title = title.trim();
    product.category = category.trim();
    product.description = description?.trim() || '';
    product.price = Number(price);
    product.stock = Number(stock) || 0;
    product.rating = Number(rating) || 0;
    product.image = image || product.image;
    
    res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар (требует авторизации)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Товар удален
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Товар не найден
 */
app.delete('/api/products/:id', authMiddleware, (req, res) => {
    const productId = req.params.id;
    
    const exists = products.some(p => p.id === productId);
    if (!exists) return res.status(404).json({ error: "Товар не найден" });
    
    products = products.filter(p => p.id !== productId);
    res.status(204).send();
});

// =========================================
// Обработка ошибок
// =========================================
app.use((req, res) => {
    res.status(404).json({ error: "Маршрут не найден" });
});

app.use((err, req, res, next) => {
    console.error("Необработанная ошибка:", err);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

// =========================================
// Запуск сервера
// =========================================
app.listen(port, () => {
    console.log('\n' + '='.repeat(70));
    console.log('✅ TECHSTORE API С АУТЕНТИФИКАЦИЕЙ ЗАПУЩЕН!');
    console.log('='.repeat(70));
    console.log(`📡 Адрес: http://localhost:${port}`);
    console.log(`📚 Swagger UI: http://localhost:${port}/api-docs`);
    console.log(`👥 Пользователей: ${users.length}`);
    console.log(`📦 Товаров: ${products.length}`);
    console.log('='.repeat(70));
    console.log('🔓 Публичные маршруты:');
    console.log(`   POST   /api/auth/register - регистрация`);
    console.log(`   POST   /api/auth/login - вход`);
    console.log(`   GET    /api/products - все товары`);
    console.log(`   GET    /api/categories - категории`);
    console.log('='.repeat(70));
    console.log('🔒 Защищенные маршруты (требуют Bearer токен):');
    console.log(`   GET    /api/auth/me - профиль`);
    console.log(`   POST   /api/products - создать товар`);
    console.log(`   GET    /api/products/:id - товар по ID`);
    console.log(`   PUT    /api/products/:id - обновить товар`);
    console.log(`   DELETE /api/products/:id - удалить товар`);
    console.log('='.repeat(70));
});