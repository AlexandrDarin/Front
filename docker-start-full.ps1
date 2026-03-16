Write-Host "🚀 Запуск TechStore (полная версия)..." -ForegroundColor Green

# Проверяем наличие .env файла
if (-not (Test-Path .env)) {
    Write-Host "📝 Создаем .env файл..." -ForegroundColor Yellow
    @"
DB_USER=techstore_user
DB_PASSWORD=techstore_password
ACCESS_SECRET=techstore_access_secret_2026_prod
REFRESH_SECRET=techstore_refresh_secret_2026_prod
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=your_secret_key
"@ | Out-File -FilePath .env
}

# Останавливаем старые контейнеры
docker-compose -f docker-compose.microservices.yml down

# Собираем и запускаем
docker-compose -f docker-compose.microservices.yml up --build -d

Write-Host "✅ TechStore (полная версия) запущен!" -ForegroundColor Green
Write-Host "=" x 50
Write-Host "📡 Frontend: http://localhost" -ForegroundColor Cyan
Write-Host "📡 API Gateway: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📡 Swagger: http://localhost:3000/api-docs" -ForegroundColor Cyan
Write-Host "📡 Adminer: http://localhost:8080" -ForegroundColor Cyan
Write-Host "📡 Redis: localhost:6379" -ForegroundColor Cyan
Write-Host "=" x 50
Write-Host "💬 Чат поддержки доступен на всех страницах" -ForegroundColor Yellow
Write-Host "📱 PWA: Можно установить на телефон через меню браузера" -ForegroundColor Yellow
Write-Host "=" x 50

# Показываем логи
docker-compose -f docker-compose.microservices.yml logs -f