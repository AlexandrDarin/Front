// Импортируем зависимости
const express = require('express');
const { nanoid } = require('nanoid');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser'); // Добавить эту строку

// Подключаем Swagger
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express(); // Сначала создаем app
const port = 3000;

// =========================================
// Константы для JWT
// =========================================
const ACCESS_SECRET = "techstore_access_secret_2026";
const REFRESH_SECRET = "techstore_refresh_secret_2026";
const ACCESS_EXPIRES_IN = "15m"; // 15 минут
const REFRESH_EXPIRES_IN = "7d";  // 7 дней
const SALT_ROUNDS = 10;

// =========================================
// Middleware
// =========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Теперь здесь правильно

// CORS для фронтенда на React
app.use(cors({
  origin: "http://localhost:3001",
  credentials: true, // Разрешаем передачу cookies
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
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
// Базы данных (в памяти)
// =========================================

// Пользователи: id, email, first_name, last_name, passwordHash, role, isActive, created_at
let users = [
    {
        id: nanoid(6),
        email: 'admin@techstore.com',
        first_name: 'Admin',
        last_name: 'TechStore',
        passwordHash: '$2b$10$XOM.rq1BHsQqWqWqWqWqWu', // password: admin123 (заглушка)
        role: 'admin',
        isActive: true,
        created_at: new Date().toISOString()
    },
    {
        id: nanoid(6),
        email: 'seller@techstore.com',
        first_name: 'Seller',
        last_name: 'TechStore',
        passwordHash: '$2b$10$XOM.rq1BHsQqWqWqWqWqWu', // password: seller123 (заглушка)
        role: 'seller',
        isActive: true,
        created_at: new Date().toISOString()
    }
];

// Хранилище refresh-токенов (в памяти)
const refreshTokens = new Set();

// Товары
let products = [
    { 
        id: nanoid(6), 
        title: 'Наушники Bose QuietComfort Ultra', 
        category: 'Аудио',
        description: 'Беспроводные наушники с активным шумоподавлением, технология Immersive Audio, до 24 часов работы',
        price: 34990, 
        stock: 15,
        rating: 4.9,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7311182222.jpg',
        createdBy: 'admin@techstore.com',
        createdAt: new Date().toISOString()
    },
    { 
        id: nanoid(6), 
        title: 'Смартфон Samsung Galaxy S24 Ultra', 
        category: 'Смартфоны',
        description: '6.8-дюймовый Dynamic AMOLED 2X, 200 МП камера, S Pen в комплекте, Snapdragon 8 Gen 3',
        price: 129990, 
        stock: 8,
        rating: 4.8,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7326345678.jpg',
        createdBy: 'admin@techstore.com',
        createdAt: new Date().toISOString()
    },
    { 
        id: nanoid(6), 
        title: 'Ноутбук Apple MacBook Pro 16" M3 Max', 
        category: 'Ноутбуки',
        description: 'Чип M3 Max с 16-ядерным CPU, 40-ядерный GPU, 48 ГБ памяти, 1 ТБ SSD',
        price: 399990, 
        stock: 3,
        rating: 5.0,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7312345678.jpg',
        createdBy: 'admin@techstore.com',
        createdAt: new Date().toISOString()
    },
    { 
        id: nanoid(6), 
        title: 'Планшет iPad Pro 13" M4', 
        category: 'Планшеты',
        description: 'Экран Ultra Retina XDR, чип M4, 512 ГБ, поддержка Apple Pencil Pro, 5G',
        price: 159990, 
        stock: 7,
        rating: 4.9,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7323456789.jpg',
        createdBy: 'admin@techstore.com',
        createdAt: new Date().toISOString()
    },
    { 
        id: nanoid(6), 
        title: 'Умные часы Apple Watch Ultra 2', 
        category: 'Гаджеты',
        description: 'Дисплей 3000 нит, чип S9, корпус из титана, водонепроницаемость 100 м',
        price: 89990, 
        stock: 12,
        rating: 4.9,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7314567890.jpg',
        createdBy: 'admin@techstore.com',
        createdAt: new Date().toISOString()
    },
    { 
        id: nanoid(6), 
        title: 'Игровая консоль PlayStation 5 Slim', 
        category: 'Игры',
        description: 'SSD 1 ТБ, поддержка 8K, 4K Ultra HD Blu-ray, контроллер DualSense',
        price: 54990, 
        stock: 5,
        rating: 4.9,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7325678901.jpg',
        createdBy: 'admin@techstore.com',
        createdAt: new Date().toISOString()
    },
    { 
        id: nanoid(6), 
        title: 'Кофемашина DeLonghi PrimaDonna Soul', 
        category: 'Для дома',
        description: 'Полностью автоматическая, 19 бар, встроенная кофемолка, капучинатор',
        price: 159990, 
        stock: 4,
        rating: 4.8,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7336789012.jpg',
        createdBy: 'admin@techstore.com',
        createdAt: new Date().toISOString()
    },
    { 
        id: nanoid(6), 
        title: 'Робот-пылесос Dreame L20 Ultra', 
        category: 'Для дома',
        description: 'Лазерная навигация, влажная уборка с подогревом, самоочистка, 7000 Па',
        price: 89990, 
        stock: 6,
        rating: 4.8,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7317890123.jpg',
        createdBy: 'admin@techstore.com',
        createdAt: new Date().toISOString()
    },
    { 
        id: nanoid(6), 
        title: 'Монитор Samsung Odyssey OLED G9', 
        category: 'Компьютеры',
        description: '49" изогнутый OLED, 240 Гц, 0.03 мс, Dual QHD, G-Sync',
        price: 219990, 
        stock: 2,
        rating: 5.0,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7328901234.jpg',
        createdBy: 'admin@techstore.com',
        createdAt: new Date().toISOString()
    },
    { 
        id: nanoid(6), 
        title: 'Клавиатура Logitech MX Mechanical Mini', 
        category: 'Компьютеры',
        description: 'Механическая, низкопрофильные переключатели, подсветка, Bluetooth',
        price: 15990, 
        stock: 11,
        rating: 4.7,
        image: 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7339012345.jpg',
        createdBy: 'admin@techstore.com',
        createdAt: new Date().toISOString()
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
 *         email:
 *           type: string
 *           format: email
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         role:
 *           type: string
 *           enum: [user, seller, admin]
 *         isActive:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
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
 *     AuthResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
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
 *     description: Аутентификация
 *   - name: Users
 *     description: Управление пользователями (только админ)
 *   - name: Products
 *     description: Управление товарами
 */

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'TechStore API - Полная версия с RBAC',
            version: '3.0.0',
            description: 'API интернет-магазина с ролевой моделью доступа (user, seller, admin)',
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
 * Хеширование пароля
 */
async function hashPassword(password) {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Генерация access-токена
 */
function generateAccessToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role
        },
        ACCESS_SECRET,
        { expiresIn: ACCESS_EXPIRES_IN }
    );
}

/**
 * Генерация refresh-токена
 */
function generateRefreshToken(user) {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            role: user.role
        },
        REFRESH_SECRET,
        { expiresIn: REFRESH_EXPIRES_IN }
    );
}

/**
 * Поиск пользователя по email
 */
function findUserByEmail(email) {
    return users.find(u => u.email === email);
}

/**
 * Поиск пользователя по ID
 */
function findUserById(id) {
    return users.find(u => u.id === id);
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

// =========================================
// Middleware для аутентификации и авторизации
// =========================================

/**
 * Middleware для проверки JWT токена
 */
function authMiddleware(req, res, next) {
    const header = req.headers.authorization || "";

    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({
            error: "Отсутствует или неверный Authorization header"
        });
    }

    try {
        const payload = jwt.verify(token, ACCESS_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({
            error: "Недействительный или просроченный токен"
        });
    }
}

/**
 * Middleware для проверки ролей
 * @param {string[]} allowedRoles - Массив разрешенных ролей
 */
function roleMiddleware(allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: "Не авторизован" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                error: "Доступ запрещен. Недостаточно прав." 
            });
        }

        next();
    };
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
            <title>TechStore API with RBAC</title>
            <style>
                body { font-family: Arial; max-width: 1200px; margin: 50px auto; padding: 20px; }
                h1 { color: #4361ee; }
                .stats { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; }
                .roles { display: flex; gap: 20px; margin: 20px 0; }
                .role-card { flex: 1; padding: 20px; border-radius: 8px; color: white; }
                .guest { background: #6c757d; }
                .user { background: #28a745; }
                .seller { background: #ffc107; color: black; }
                .admin { background: #dc3545; }
                ul { list-style: none; padding: 0; }
                li { margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; }
                a { color: #4361ee; text-decoration: none; }
                a:hover { text-decoration: underline; }
                .badge { background: #4361ee; color: white; padding: 3px 8px; border-radius: 12px; font-size: 12px; }
            </style>
        </head>
        <body>
            <h1>🛍️ TechStore API с ролевой моделью (RBAC)</h1>
            <div class="stats">
                <p>👥 Пользователей: ${users.length}</p>
                <p>📦 Товаров: ${products.length}</p>
                <p>🔐 Access Token: истекает через 15 минут</p>
                <p>🔄 Refresh Token: истекает через 7 дней</p>
            </div>
            
            <h2>Роли пользователей:</h2>
            <div class="roles">
                <div class="role-card guest">👤 Гость<br><small>Только просмотр товаров</small></div>
                <div class="role-card user">👤 Пользователь<br><small>Просмотр товаров</small></div>
                <div class="role-card seller">👤 Продавец<br><small>Управление товарами</small></div>
                <div class="role-card admin">👤 Администратор<br><small>Управление пользователями</small></div>
            </div>
            
            <p>📚 <a href="/api-docs">Swagger документация</a> <span class="badge">OpenAPI 3.0</span></p>
            
            <h2>Доступные endpoints:</h2>
            
            <h3>🔓 Публичные (доступны всем):</h3>
            <ul>
                <li><strong>POST</strong> /api/auth/register - регистрация</li>
                <li><strong>POST</strong> /api/auth/login - вход (получение токенов)</li>
                <li><strong>POST</strong> /api/auth/refresh - обновление токенов</li>
                <li><strong>GET</strong> /api/products - список товаров</li>
                <li><strong>GET</strong> /api/categories - категории</li>
            </ul>
            
            <h3>🔒 Защищенные (требуют аутентификации):</h3>
            <ul>
                <li><strong>GET</strong> /api/auth/me - профиль (любой пользователь)</li>
            </ul>
            
            <h3>👑 Продавец и админ (POST /api/products):</h3>
            <ul>
                <li><strong>POST</strong> /api/products - создать товар</li>
                <li><strong>PUT</strong> /api/products/:id - обновить товар</li>
                <li><strong>GET</strong> /api/products/:id - детали товара</li>
            </ul>
            
            <h3>👑 Только администратор:</h3>
            <ul>
                <li><strong>GET</strong> /api/users - список пользователей</li>
                <li><strong>GET</strong> /api/users/:id - пользователь по ID</li>
                <li><strong>PUT</strong> /api/users/:id - обновить пользователя</li>
                <li><strong>DELETE</strong> /api/users/:id - заблокировать пользователя</li>
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
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: qwerty123
 *               first_name:
 *                 type: string
 *                 example: Иван
 *               last_name:
 *                 type: string
 *                 example: Петров
 *     responses:
 *       201:
 *         description: Пользователь создан
 *       400:
 *         description: Ошибка валидации
 *       409:
 *         description: Email уже используется
 */
app.post("/api/auth/register", async (req, res) => {
    const { email, password, first_name, last_name } = req.body;

    if (!email || !password || !first_name || !last_name) {
        return res.status(400).json({ 
            error: "Все поля обязательны: email, password, first_name, last_name" 
        });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Неверный формат email" });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: "Пароль должен быть минимум 6 символов" });
    }

    const existingUser = findUserByEmail(email);
    if (existingUser) {
        return res.status(409).json({ error: "Пользователь с таким email уже существует" });
    }

    const passwordHash = await hashPassword(password);

    const newUser = {
        id: nanoid(6),
        email,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        passwordHash,
        role: 'user', // По умолчанию обычный пользователь
        isActive: true,
        created_at: new Date().toISOString()
    };

    users.push(newUser);

    res.status(201).json({
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role,
        created_at: newUser.created_at
    });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
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

    if (!user.isActive) {
        return res.status(403).json({ error: "Аккаунт заблокирован" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
        return res.status(401).json({ error: "Неверные учетные данные" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    refreshTokens.add(refreshToken);

    // Устанавливаем refresh token в httpOnly cookie (ПР №10)
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false, // В продакшене должно быть true с HTTPS
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней в миллисекундах
    });

    res.json({
        accessToken,
        refreshToken, // Также отправляем в теле для поддержки localStorage
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
 * /api/auth/refresh:
 *   post:
 *     summary: Обновление пары токенов
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Новая пара токенов
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Недействительный refresh token
 */
app.post("/api/auth/refresh", (req, res) => {
    // Пытаемся получить токен из тела запроса или из cookies
    const { refreshToken } = req.body;
    const cookieToken = req.cookies?.refreshToken;
    const token = refreshToken || cookieToken;

    if (!token) {
        return res.status(400).json({ error: "refreshToken is required" });
    }

    if (!refreshTokens.has(token)) {
        return res.status(401).json({ error: "Invalid refresh token" });
    }

    try {
        const payload = jwt.verify(token, REFRESH_SECRET);

        const user = findUserById(payload.sub);
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }

        if (!user.isActive) {
            return res.status(403).json({ error: "Account is blocked" });
        }

        // Ротация refresh-токена (удаляем старый, создаем новый)
        refreshTokens.delete(token);

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        refreshTokens.add(newRefreshToken);

        // Обновляем cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role
            }
        });
    } catch (err) {
        // Если токен недействителен, удаляем его из хранилища
        refreshTokens.delete(token);
        return res.status(401).json({ error: "Invalid or expired refresh token" });
    }
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
 *       401:
 *         description: Не авторизован
 */
app.get("/api/auth/me", authMiddleware, (req, res) => {
    const userId = req.user.sub;
    const user = findUserById(userId);
    
    if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
    }

    res.json({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        created_at: user.created_at
    });
});

// =========================================
// Маршруты для управления пользователями (только админ)
// =========================================

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список пользователей (только админ)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 *       403:
 *         description: Доступ запрещен
 */
app.get("/api/users", authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const userList = users.map(({ passwordHash, ...user }) => user);
    res.json(userList);
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Получить пользователя по ID (только админ)
 *     tags: [Users]
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
 *         description: Данные пользователя
 *       404:
 *         description: Пользователь не найден
 */
app.get("/api/users/:id", authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
    }
    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Обновить информацию пользователя (только админ)
 *     tags: [Users]
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
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, seller, admin]
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Пользователь обновлен
 *       404:
 *         description: Пользователь не найден
 */
app.put("/api/users/:id", authMiddleware, roleMiddleware(['admin']), async (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
    }

    const { first_name, last_name, role, isActive } = req.body;

    if (first_name !== undefined) user.first_name = first_name.trim();
    if (last_name !== undefined) user.last_name = last_name.trim();
    if (role !== undefined && ['user', 'seller', 'admin'].includes(role)) {
        user.role = role;
    }
    if (isActive !== undefined) user.isActive = isActive;

    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Заблокировать пользователя (только админ)
 *     tags: [Users]
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
 *         description: Пользователь заблокирован
 *       404:
 *         description: Пользователь не найден
 */
app.delete("/api/users/:id", authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
    }

    user.isActive = false;
    res.json({ message: "Пользователь заблокирован" });
});

// =========================================
// Публичные маршруты для товаров (доступны всем)
// =========================================

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Получить все категории (доступно всем)
 *     tags: [Products]
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
 *     summary: Получить все товары (доступно всем)
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
        products: filteredProducts
    });
});

// =========================================
// Защищенные маршруты для товаров (требуют аутентификации и ролей)
// =========================================

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар (продавец и админ)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Товар создан
 *       403:
 *         description: Доступ запрещен
 */
app.post('/api/products', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
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
        image: image || 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7311182222.jpg',
        createdBy: req.user.email,
        createdAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID (доступно всем)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Детальная информация о товаре
 *       404:
 *         description: Товар не найден
 */
app.get('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    const product = products.find(p => p.id == productId);
    
    if (!product) {
        return res.status(404).json({ error: "Товар не найден" });
    }
    
    res.json(product);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновить товар (продавец и админ)
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
 *         description: Товар обновлен
 *       403:
 *         description: Доступ запрещен
 *       404:
 *         description: Товар не найден
 */
app.put('/api/products/:id', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
    const productId = req.params.id;
    const product = products.find(p => p.id == productId);
    
    if (!product) {
        return res.status(404).json({ error: "Товар не найден" });
    }
    
    const { title, category, description, price, stock, rating, image } = req.body;
    
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
 *     summary: Удалить товар (только админ)
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
 *       403:
 *         description: Доступ запрещен
 *       404:
 *         description: Товар не найден
 */
app.delete('/api/products/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const productId = req.params.id;
    
    const index = products.findIndex(p => p.id === productId);
    if (index === -1) {
        return res.status(404).json({ error: "Товар не найден" });
    }
    
    products.splice(index, 1);
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
    console.log('\n' + '='.repeat(80));
    console.log('✅ TECHSTORE API С РОЛЕВОЙ МОДЕЛЬЮ (RBAC) ЗАПУЩЕН!');
    console.log('='.repeat(80));
    console.log(`📡 Адрес: http://localhost:${port}`);
    console.log(`📚 Swagger UI: http://localhost:${port}/api-docs`);
    console.log(`👥 Пользователей: ${users.length}`);
    console.log(`📦 Товаров: ${products.length}`);
    console.log('='.repeat(80));
    console.log('🔓 Публичные маршруты (доступны всем):');
    console.log(`   POST   /api/auth/register - регистрация`);
    console.log(`   POST   /api/auth/login - вход`);
    console.log(`   POST   /api/auth/refresh - обновление токенов`);
    console.log(`   GET    /api/products - все товары`);
    console.log(`   GET    /api/categories - категории`);
    console.log('='.repeat(80));
    console.log('🔒 Защищенные маршруты (требуют аутентификации):');
    console.log(`   GET    /api/auth/me - профиль (любой)`);
    console.log('='.repeat(80));
    console.log('👑 Продавец и админ:');
    console.log(`   POST   /api/products - создать товар`);
    console.log(`   PUT    /api/products/:id - обновить товар`);
    console.log('='.repeat(80));
    console.log('👑 Только администратор:');
    console.log(`   GET    /api/users - список пользователей`);
    console.log(`   GET    /api/users/:id - пользователь по ID`);
    console.log(`   PUT    /api/users/:id - обновить пользователя`);
    console.log(`   DELETE /api/users/:id - заблокировать пользователя`);
    console.log(`   DELETE /api/products/:id - удалить товар`);
    console.log('='.repeat(80));
});