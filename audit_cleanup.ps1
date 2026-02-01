Write-Host ">>> INICIANDO LIMPIEZA DE AUDITORÍA SIIEC <<<" -ForegroundColor Cyan

# Lista de patrones sensibles a verificar
$sensitivePatterns = @(".env", ".env.local", ".env.production", "*.pem", "*.key", "server/keys/")

# Función para verificar y remover archivos del índice de Git
function Clear-SensitivePattern {
    param (
        [string]$Pattern
    )
    
    Write-Host "Verificando patrón: $Pattern" -NoNewline
    
    # Check if files matching pattern are tracked using git ls-files
    $trackedFiles = git ls-files $Pattern 2>$null
    
    if ($trackedFiles) {
        Write-Host " [⚠️ ENCONTRADO EN GIT]" -ForegroundColor Yellow
        Write-Host "   -> Removiendo del índice (manteniendo archivo local)..." 
        
        # Remove from index only (--cached)
        git rm --cached $Pattern -r -f 2>$null
        
        if ($?) {
            Write-Host "   ✓ REMOVIDO EXITOSAMENTE" -ForegroundColor Green
        }
        else {
            Write-Host "   ❌ ERROR AL REMOVER (Verifique permisos)" -ForegroundColor Red
        }
    }
    else {
        Write-Host " [✓ SEGURO / NO RASTREADO]" -ForegroundColor Green
    }
}

# Ejecutar limpieza
foreach ($p in $sensitivePatterns) {
    Clear-SensitivePattern -Pattern $p
}

Write-Host "`n>>> VERIFICACIÓN DE GITIGNORE <<<" -ForegroundColor Cyan
# Verificar que .env esté en .gitignore
if (Select-String -Path .gitignore -Pattern "\.env" -Quiet) {
    Write-Host "✓ .env está listado en .gitignore raíz" -ForegroundColor Green
}
else {
    Write-Host "⚠️ ADVERTENCIA: .env podría no estar en .gitignore raíz" -ForegroundColor Yellow
}

Write-Host "`n>>> AUDITORÍA COMPLETADA <<<" -ForegroundColor Cyan
Write-Host "Los archivos sensibles han sido removidos del área de staging/index de Git."
Write-Host "Por favor, ejecute 'git commit -m \"chore: security cleanup\"' para confirmar los cambios en el historial."
