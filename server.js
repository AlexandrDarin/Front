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
            version: '2.0.0',
            description: 'Полное API для интернет-магазина электроники',
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: 'Локальный сервер',
            },
        ],
    },
    apis: ['./swagger.js']
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

// База данных в памяти (для простоты)
let users = [
    {
        id: nanoid(6),
        email: 'admin@techstore.com',
        first_name: 'Admin',
        last_name: 'TechStore',
        passwordHash: '$2b$10$XOM.rq1BHsQqWqWqWqWqWu',
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

let orders = [];
let refreshTokens = [];
let cartItems = [];

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
 * components:
 *   schemas:
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
 *           enum: [user, seller, admin]
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
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         user_id:
 *           type: string
 *         total_amount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, paid, shipped, delivered, cancelled]
 *         created_at:
 *           type: string
 *     CartItem:
 *       type: object
 *       properties:
 *         product_id:
 *           type: string
 *         quantity:
 *           type: integer
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   - name: Info
 *     description: Общая информация
 *   - name: Auth
 *     description: Аутентификация и управление пользователями
 *   - name: Users
 *     description: Управление пользователями (только для админов)
 *   - name: Products
 *     description: Товары
 *   - name: Orders
 *     description: Заказы
 *   - name: Cart
 *     description: Корзина
 */

// =========================================
// Базовые маршруты
// =========================================

/**
 * @swagger
 * /:
 *   get:
 *     summary: Главная страница API
 *     tags: [Info]
 *     responses:
 *       200:
 *         description: Успешный ответ
 */
app.get('/', (req, res) => {
    res.send('TechStore API is running!');
});

// =========================================
// Auth маршруты
// =========================================

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
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *               first_name:
 *                 type: string
 *                 example: "Иван"
 *               last_name:
 *                 type: string
 *                 example: "Петров"
 *     responses:
 *       201:
 *         description: Пользователь создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Ошибка в данных
 *       409:
 *         description: Email уже используется
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
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "password123"
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Неверные данные
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
        { sub: user.id, email: user.email, role: user.role },
        ACCESS_SECRET,
        { expiresIn: ACCESS_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
        { sub: user.id },
        REFRESH_SECRET,
        { expiresIn: REFRESH_EXPIRES_IN }
    );

    refreshTokens.push(refreshToken);

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
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Недействительный refresh token
 */
app.post("/api/auth/refresh", (req, res) => {
    const { refreshToken } = req.body;
    const cookieToken = req.cookies?.refreshToken;
    const token = refreshToken || cookieToken;

    if (!token) {
        return res.status(400).json({ error: "Требуется refresh token" });
    }

    if (!refreshTokens.includes(token)) {
        return res.status(401).json({ error: "Недействительный refresh token" });
    }

    try {
        const payload = jwt.verify(token, REFRESH_SECRET);
        const user = users.find(u => u.id === payload.sub);

        if (!user || !user.isActive) {
            return res.status(401).json({ error: "Пользователь не найден" });
        }

        const newAccessToken = jwt.sign(
            { sub: user.id, email: user.email, role: user.role },
            ACCESS_SECRET,
            { expiresIn: ACCESS_EXPIRES_IN }
        );

        const newRefreshToken = jwt.sign(
            { sub: user.id },
            REFRESH_SECRET,
            { expiresIn: REFRESH_EXPIRES_IN }
        );

        const index = refreshTokens.indexOf(token);
        if (index > -1) refreshTokens.splice(index, 1);
        refreshTokens.push(newRefreshToken);

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (err) {
        return res.status(401).json({ error: "Недействительный refresh token" });
    }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить информацию о текущем пользователе
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Информация о пользователе
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Не авторизован
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

// =========================================
// Users маршруты (только админ)
// =========================================

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Получить список пользователей
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Доступ запрещен
 */
app.get('/api/users', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const userList = users.map(({ passwordHash, ...user }) => user);
    res.json(userList);
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Обновить пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
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
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Пользователь обновлен
 */
app.get('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
        return res.status(404).json({ error: "Пользователь не найден" });
    }
    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

// =========================================
// Products маршруты
// =========================================

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список товаров
 *     tags: [Products]
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
 *     responses:
 *       200:
 *         description: Товар
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
        return res.status(404).json({ error: "Товар не найден" });
    }
    res.json(product);
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар
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
 */
app.post('/api/products', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
    const { title, category, description, price, stock, rating, image } = req.body;

    if (!title || !price || !category) {
        return res.status(400).json({ error: 'Название, цена и категория обязательны' });
    }

    const newProduct = {
        id: nanoid(6),
        title,
        category,
        description,
        price,
        stock: stock || 0,
        rating: rating || 0,
        image: image || 'https://cdn1.ozone.ru/s3/multimedia-1-2/c600/7311182222.jpg',
        created_by: req.user.email
    };

    products.push(newProduct);
    res.status(201).json(newProduct);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновить товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Товар обновлен
 */
app.put('/api/products/:id', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
        return res.status(404).json({ error: "Товар не найден" });
    }

    const { title, category, description, price, stock, rating, image } = req.body;
    Object.assign(product, { title, category, description, price, stock, rating, image });

    res.json(product);
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Заблокировать пользователя (деактивировать)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Пользователь заблокирован
 */
app.delete('/api/products/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
    const index = products.findIndex(p => p.id === req.params.id);
    if (index === -1) {
        return res.status(404).json({ error: "Товар не найден" });
    }
    products.splice(index, 1);
    res.status(204).send();
});

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Получить список категорий
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список категорий
 */
app.get('/api/categories', (req, res) => {
    const categories = [...new Set(products.map(p => p.category))];
    res.json(categories);
});

// =========================================
// Orders маршруты
// =========================================

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Создать новый заказ
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - shipping_address
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/CartItem'
 *               shipping_address:
 *                 type: string
 *               payment_method:
 *                 type: string
 *     responses:
 *       201:
 *         description: Заказ создан
 */
app.post('/api/orders', authMiddleware, (req, res) => {
    const { items, shipping_address, payment_method = 'card' } = req.body;
    const userId = req.user.sub;

    if (!items || !items.length || !shipping_address) {
        return res.status(400).json({ error: "Недостаточно данных для заказа" });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
        const product = products.find(p => p.id === item.product_id);
        if (!product) {
            return res.status(400).json({ error: `Товар ${item.product_id} не найден` });
        }
        if (product.stock < item.quantity) {
            return res.status(400).json({ error: `Недостаточно товара ${product.title} на складе` });
        }
        totalAmount += product.price * item.quantity;
        product.stock -= item.quantity;
        orderItems.push({
            product_id: product.id,
            quantity: item.quantity,
            price_at_time: product.price,
            product_title: product.title
        });
    }

    const order = {
        id: nanoid(6),
        user_id: userId,
        total_amount: totalAmount,
        status: 'pending',
        shipping_address,
        payment_method,
        items: orderItems,
        created_at: new Date().toISOString()
    };

    orders.push(order);

    // Очищаем корзину пользователя
    cartItems = cartItems.filter(c => c.user_id !== userId);

    res.status(201).json({
        id: order.id,
        total_amount: order.total_amount,
        status: order.status,
        created_at: order.created_at
    });
});

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Получить заказы текущего пользователя
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список заказов
 */
app.get('/api/orders', authMiddleware, (req, res) => {
    const userOrders = orders.filter(o => o.user_id === req.user.sub);
    res.json(userOrders);
});

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Получить детали заказа
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Детали заказа
 *       404:
 *         description: Заказ не найден
 */
app.get('/api/orders/:id', authMiddleware, (req, res) => {
    const order = orders.find(o => o.id === req.params.id && o.user_id === req.user.sub);
    if (!order) {
        return res.status(404).json({ error: "Заказ не найден" });
    }
    res.json(order);
});

// =========================================
// Cart маршруты
// =========================================

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Получить корзину пользователя
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Корзина
 */
app.get('/api/cart', authMiddleware, (req, res) => {
    const userCart = cartItems.filter(c => c.user_id === req.user.sub);
    res.json(userCart);
});

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Добавить товар в корзину
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *             properties:
 *               product_id:
 *                 type: string
 *               quantity:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       201:
 *         description: Товар добавлен
 */
app.post('/api/cart', authMiddleware, (req, res) => {
    const { product_id, quantity = 1 } = req.body;

    const existing = cartItems.find(c => c.user_id === req.user.sub && c.product_id === product_id);
    if (existing) {
        existing.quantity += quantity;
    } else {
        cartItems.push({
            user_id: req.user.sub,
            product_id,
            quantity
        });
    }

    res.status(201).json({ product_id, quantity });
});

/**
 * @swagger
 * /api/cart/{product_id}:
 *   put:
 *     summary: Обновить количество товара в корзине
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Количество обновлено
 */
app.put('/api/cart/:product_id', authMiddleware, (req, res) => {
    const item = cartItems.find(c => c.user_id === req.user.sub && c.product_id === req.params.product_id);

    if (!item) {
        return res.status(404).json({ error: "Товар не найден в корзине" });
    }

    const { quantity } = req.body;
    if (quantity < 1) {
        const index = cartItems.indexOf(item);
        cartItems.splice(index, 1);
        return res.json({ message: "Товар удален из корзины" });
    }

    item.quantity = quantity;
    res.json(item);
});

/**
 * @swagger
 * /api/cart/{product_id}:
 *   delete:
 *     summary: Удалить товар из корзины
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: product_id
 *         required: true
 *     responses:
 *       204:
 *         description: Товар удален
 */
app.delete('/api/cart/:product_id', authMiddleware, (req, res) => {
    cartItems = cartItems.filter(c => !(c.user_id === req.user.sub && c.product_id === req.params.product_id));
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
    console.log('\n' + '='.repeat(50));
    console.log('✅ TECHSTORE API ЗАПУЩЕН!');
    console.log('='.repeat(50));
    console.log(`📡 http://localhost:${port}`);
    console.log(`📚 Swagger: http://localhost:${port}/api-docs`);
    console.log('='.repeat(50));
    console.log('📌 Доступные маршруты:');
    console.log('   Auth:     POST   /api/auth/register, /api/auth/login, /api/auth/refresh, GET /api/auth/me');
    console.log('   Users:    GET    /api/users, /api/users/:id (admin only)');
    console.log('   Products: GET    /api/products, /api/products/:id, POST, PUT, DELETE');
    console.log('   Orders:   POST   /api/orders, GET /api/orders, /api/orders/:id');
    console.log('   Cart:     GET    /api/cart, POST, PUT, DELETE');
    console.log('='.repeat(50));
});