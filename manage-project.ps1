# Scripts útiles para gestionar el proyecto CRM Cloud

# Cambiar al directorio del proyecto
$projectDir = "C:\Users\Daniel\OneDrive - UPB\Desktop\UPB\Semestre 7\TIC2\crm-cloud\CRM-Cloud-MVP-Gestion-de-Clientes"

function Show-Menu {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "      CRM Cloud - Gestión Docker" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Ver estado de contenedores" -ForegroundColor White
    Write-Host "2. Ver logs del backend" -ForegroundColor White
    Write-Host "3. Ver logs del frontend" -ForegroundColor White
    Write-Host "4. Ver logs de PostgreSQL" -ForegroundColor White
    Write-Host "5. Reiniciar backend" -ForegroundColor Yellow
    Write-Host "6. Reiniciar PostgreSQL" -ForegroundColor Yellow
    Write-Host "7. Reiniciar todos los servicios" -ForegroundColor Yellow
    Write-Host "8. Detener todos los servicios" -ForegroundColor Red
    Write-Host "9. Levantar todos los servicios" -ForegroundColor Green
    Write-Host "10. Probar conexión a BD" -ForegroundColor Cyan
    Write-Host "11. Conectarse a PostgreSQL (terminal)" -ForegroundColor Cyan
    Write-Host "0. Salir" -ForegroundColor Gray
    Write-Host ""
}

function Execute-DockerCommand {
    param($command)
    Push-Location $projectDir
    Invoke-Expression $command
    Pop-Location
    Write-Host "`nPresiona cualquier tecla para continuar..." -ForegroundColor Gray
    $null = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

do {
    Clear-Host
    Show-Menu
    $option = Read-Host "Selecciona una opción"
    
    switch ($option) {
        "1" { Execute-DockerCommand "docker compose ps" }
        "2" { Execute-DockerCommand "docker compose logs backend --tail 50" }
        "3" { Execute-DockerCommand "docker compose logs frontend --tail 50" }
        "4" { Execute-DockerCommand "docker compose logs db --tail 50" }
        "5" { Execute-DockerCommand "docker compose restart backend" }
        "6" { Execute-DockerCommand "docker compose restart db" }
        "7" { Execute-DockerCommand "docker compose restart" }
        "8" { 
            Write-Host "`n¿Estás seguro? (S/N): " -ForegroundColor Yellow -NoNewline
            $confirm = Read-Host
            if ($confirm -eq "S" -or $confirm -eq "s") {
                Execute-DockerCommand "docker compose down"
            }
        }
        "9" { Execute-DockerCommand "docker compose up -d" }
        "10" { Execute-DockerCommand ".\test-db-connection.ps1" }
        "11" { Execute-DockerCommand "docker exec -it -e PGPASSWORD=postgres crm_postgres psql -U postgres -d crm_cloud" }
        "0" { 
            Write-Host "`nSaliendo..." -ForegroundColor Green
            break 
        }
        default { 
            Write-Host "`nOpción no válida" -ForegroundColor Red
            Start-Sleep -Seconds 1
        }
    }
} while ($option -ne "0")
