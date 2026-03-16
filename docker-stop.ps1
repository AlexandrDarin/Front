# docker-stop.ps1
Write-Host "🛑 Остановка TechStore..." -ForegroundColor Yellow
docker-compose down
Write-Host "✅ Контейнеры остановлены" -ForegroundColor Green