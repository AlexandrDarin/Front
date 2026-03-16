// Импортируем зависимости
const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// Подключаем Swagger
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const port = 3000;

// =========================================
// Swagger Configuration
// =========================================
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TechStore API',
            version: '1.0.0',
            description: 'API для интернет-магазина электроники',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Локальный сервер',
            },
        ],
    },
    apis: ['./server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Константы для JWT
const ACCESS_SECRET = "techstore_access_secret_2026";
const REFRESH_SECRET = "techstore_refresh_secret_2026";
const ACCESS_EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "7d";
const SALT_ROUNDS = 10;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost", "http://localhost:3001"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// База данных в памяти
let users = [
    {
        id: nanoid(6),
        email: 'admin@techstore.com',
        first_name: 'Admin',
        last_name: 'TechStore',
        passwordHash: '$2b$10$XOM.rq1BHsQqWqWqWqWqWu', // password: admin123
        role: 'admin',
        isActive: true,
        created_at: new Date().toISOString()
    }
];

let products = [
    { 
        id: nanoid(6), 
        title: 'Наушники Bose QuietComfort Ultra', 
        category: 'Аудио',
        description: 'Беспроводные наушники с активным шумоподавлением',
        price: 34990, 
        stock: 15,
        rating: 4.9,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7311182222.jpg'
    },
    { 
        id: nanoid(6), 
        title: 'Смартфон Samsung Galaxy S24 Ultra', 
        category: 'Смартфоны',
        description: '6.8-дюймовый Dynamic AMOLED 2X, 200 МП камера',
        price: 129990, 
        stock: 8,
        rating: 4.8,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7326345678.jpg'
    }
];

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
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
 *     User:
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
 *         role:
 *           type: string
 */

// Функции-помощники
async function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}

// Middleware для аутентификации
function authMiddleware(req, res, next) {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ error: "Не авторизован" });
    }

    try {
        const payload = jwt.verify(token, ACCESS_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Недействительный токен" });
    }
}

// Middleware для проверки ролей
function roleMiddleware(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Не авторизован" });
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: "Доступ запрещен" });
        }
        next();
    };
}

/**
 * @swagger
 * /:
 *   get:
 *     summary: Главная страница API
 *     responses:
 *       200:
 *         description: Успешный ответ
 */
app.get('/', (req, res) => {
    res.send('TechStore API is running!');
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список товаров
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
 *                 products:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 */
app.get('/api/products', (req, res) => {
    res.json({ count: products.length, products });
});

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Получить список категорий
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
 * /api/auth/register:
 *   post:
 *     summary: Регистрация пользователя
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
 *               password:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Пользователь создан
 */
app.post("/api/auth/register", async (req, res) => {
    const { email, password, first_name, last_name } = req.body;
    
    if (!email || !password || !first_name || !last_name) {
        return res.status(400).json({ error: "Все поля обязательны" });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(409).json({ error: "Email уже используется" });
    }

    const passwordHash = await hashPassword(password);
    const newUser = {
        id: nanoid(6),
        email,
        first_name,
        last_name,
        passwordHash,
        role: 'user',
        isActive: true,
        created_at: new Date().toISOString()
    };

    users.push(newUser);
    res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role
    });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешный вход
 */
app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(401).json({ error: "Неверные данные" });
    }

    if (!user.isActive) {
        return res.status(403).json({ error: "Аккаунт заблокирован" });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
        return res.status(401).json({ error: "Неверные данные" });
    }

    const accessToken = jwt.sign(
        { sub: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role },
        ACCESS_SECRET,
        { expiresIn: ACCESS_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
        { sub: user.id },
        REFRESH_SECRET,
        { expiresIn: REFRESH_EXPIRES_IN }
    );

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role
        }
    });
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить информацию о текущем пользователе
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Информация о пользователе
 */
app.get("/api/auth/me", authMiddleware, (req, res) => {
    const user = users.find(u => u.id === req.user.sub);
    if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
    }
    res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log('\n' + '='.repeat(50));
    console.log('✅ TECHSTORE API ЗАПУЩЕН!');
    console.log('='.repeat(50));
    console.log(`📡 http://localhost:${port}`);
    console.log(`📚 Swagger: http://localhost:${port}/api-docs`);
    console.log(`📦 Товаров: ${products.length}`);
    console.log(`👥 Пользователей: ${users.length}`);
    console.log('='.repeat(50));
});