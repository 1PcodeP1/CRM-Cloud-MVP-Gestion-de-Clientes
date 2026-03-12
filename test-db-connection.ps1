# Script para probar la conexión a PostgreSQL
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Prueba de Conexión PostgreSQL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Conexión desde dentro del contenedor
Write-Host "[Test 1] Conexión desde dentro del contenedor..." -ForegroundColor Yellow
$env:PGPASSWORD = 'postgres'
docker exec -e PGPASSWORD=postgres crm_postgres psql -U postgres -d crm_cloud -c "SELECT 'OK' as status;" 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Contenedor: FUNCIONA" -ForegroundColor Green
} else {
    Write-Host "❌ Contenedor: ERROR" -ForegroundColor Red
}

Write-Host ""
Write-Host "[Test 2] Verificando puerto expuesto..." -ForegroundColor Yellow
$tcpConnection = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue
if ($tcpConnection.TcpTestSucceeded) {
    Write-Host "✅ Puerto 5432: ABIERTO" -ForegroundColor Green
} else {
    Write-Host "❌ Puerto 5432: CERRADO" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CREDENCIALES CORRECTAS:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Host:       localhost" -ForegroundColor White
Write-Host "  Puerto:     5432" -ForegroundColor White
Write-Host "  Usuario:    postgres" -ForegroundColor White
Write-Host "  Contraseña: postgres" -ForegroundColor White
Write-Host "  Base datos: crm_cloud" -ForegroundColor White
Write-Host ""
Write-Host "  URL de conexión:" -ForegroundColor Yellow
Write-Host "  postgresql://postgres:postgres@localhost:5432/crm_cloud" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Red
Write-Host "1. Asegúrate de ESCRIBIR (no copiar) las credenciales" -ForegroundColor Yellow
Write-Host "2. Borra cualquier conexión existente en tu IDE" -ForegroundColor Yellow
Write-Host "3. Crea una NUEVA conexión desde cero" -ForegroundColor Yellow
Write-Host ""
