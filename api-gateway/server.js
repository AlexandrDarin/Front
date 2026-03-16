const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Прокси для сервиса аутентификации
app.use('/api/auth', createProxyMiddleware({
    target: 'http://auth-service:3001',
    changeOrigin: true,
    pathRewrite: {
        '^/api/auth': '/'
    }
}));

// Прокси для сервиса товаров
app.use('/api/products', createProxyMiddleware({
    target: 'http://product-service:3002',
    changeOrigin: true,
    pathRewrite: {
        '^/api/products': '/'
    }
}));

// Прокси для сервиса заказов
app.use('/api/orders', createProxyMiddleware({
    target: 'http://order-service:3003',
    changeOrigin: true,
    pathRewrite: {
        '^/api/orders': '/'
    }
}));

// Прокси для сервиса оплаты
app.use('/api/payments', createProxyMiddleware({
    target: 'http://payment-service:3004',
    changeOrigin: true,
    pathRewrite: {
        '^/api/payments': '/'
    }
}));

// WebSocket прокси для чата
app.use('/socket.io', createProxyMiddleware({
    target: 'http://chat-service:3005',
    changeOrigin: true,
    ws: true
}));

app.listen(port, () => {
    console.log(`API Gateway running on port ${port}`);
});