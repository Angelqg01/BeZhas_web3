# BeZhas Optimization - Cleanup Script
# Elimina archivos innecesarios para optimizar la DApp

Write-Host "🧹 BeZhas Optimization Cleanup Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = "d:\Documentos D\Documentos Yoe\BeZhas\BeZhas Web\bezhas-web3"
$deletedFiles = 0
$deletedFolders = 0

# Función para eliminar archivo de forma segura
function Remove-SafeFile {
    param([string]$path)
    if (Test-Path $path) {
        Remove-Item $path -Force
        $script:deletedFiles++
        Write-Host "✓ Eliminado: $path" -ForegroundColor Green
    }
}

# Función para eliminar carpeta de forma segura
function Remove-SafeFolder {
    param([string]$path)
    if (Test-Path $path) {
        Remove-Item $path -Recurse -Force
        $script:deletedFolders++
        Write-Host "✓ Eliminada carpeta: $path" -ForegroundColor Green
    }
}

Write-Host "🗑️  FASE 1: Eliminando componentes sociales innecesarios..." -ForegroundColor Yellow
Write-Host ""

# Componentes sociales a eliminar
$socialComponents = @(
    "frontend\src\components\social-feed\Stories.jsx",
    "frontend\src\components\social-feed\StoriesRail.jsx",
    "frontend\src\components\social-feed\ReelInFeedCard.jsx",
    "frontend\src\components\social-feed\Recommendations.jsx",
    "frontend\src\components\social-feed\Suggestions.jsx"
)

foreach ($file in $socialComponents) {
    Remove-SafeFile "$rootPath\$file"
}

Write-Host ""
Write-Host "🗑️  FASE 2: Eliminando páginas DAO complejas..." -ForegroundColor Yellow
Write-Host ""

# Páginas DAO a eliminar
$daoPages = @(
    "frontend\src\pages\dao\GovernanceHub.jsx",
    "frontend\src\pages\dao\PluginManager.jsx",
    "frontend\src\pages\dao\TalentDashboard.jsx"
)

foreach ($file in $daoPages) {
    Remove-SafeFile "$rootPath\$file"
}

Write-Host ""
Write-Host "🗑️  FASE 3: Eliminando gamificación excesiva..." -ForegroundColor Yellow
Write-Host ""

# Páginas de gamificación a eliminar
$gamificationPages = @(
    "frontend\src\pages\QuestsPage.jsx",
    "frontend\src\pages\BadgesPage.jsx",
    "frontend\src\pages\RanksPageNew.jsx"
)

foreach ($file in $gamificationPages) {
    Remove-SafeFile "$rootPath\$file"
}

Write-Host ""
Write-Host "🗑️  FASE 4: Eliminando servicios AI duplicados..." -ForegroundColor Yellow
Write-Host ""

# Servicios AI a eliminar
$aiServices = @(
    "backend\services\aiPluginService.js",
    "backend\services\personalAI.service.js",
    "backend\services\autoTagger.service.js"
)

foreach ($file in $aiServices) {
    Remove-SafeFile "$rootPath\$file"
}

Write-Host ""
Write-Host "🗑️  FASE 5: Eliminando rutas backend innecesarias..." -ForegroundColor Yellow
Write-Host ""

# Rutas backend a eliminar
$backendRoutes = @(
    "backend\routes\quests.routes.js",
    "backend\routes\badges.routes.js"
)

foreach ($file in $backendRoutes) {
    Remove-SafeFile "$rootPath\$file"
}

Write-Host ""
Write-Host "🗑️  FASE 6: Eliminando carpeta Aegis (ML separado)..." -ForegroundColor Yellow
Write-Host ""

Remove-SafeFolder "$rootPath\aegis"

Write-Host ""
Write-Host "✅ LIMPIEZA COMPLETADA" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "📊 Archivos eliminados: $deletedFiles" -ForegroundColor White
Write-Host "📂 Carpetas eliminadas: $deletedFolders" -ForegroundColor White
Write-Host ""
Write-Host "⚡ La DApp ahora es más rápida y enfocada!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Ejecutar: npm run build" -ForegroundColor White
Write-Host "2. Probar la aplicación" -ForegroundColor White
Write-Host "3. Verificar que todo funciona correctamente" -ForegroundColor White
