# Check for Administrator privileges
if (!([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "⚠️  Este script necesita permisos de Administrador." -ForegroundColor Red
    Write-Host "Por favor, haz clic derecho en el archivo y selecciona 'Ejecutar con PowerShell como Administrador'."
    Pause
    Exit
}

Write-Host "🛡️  Configurando Firewall de Windows para Task Manager PWA..." -ForegroundColor Cyan

# Rule for Apache (Port 80)
$apacheRuleName = "Allow Apache HTTP Port 80"
Write-Host "Configurando regla para Apache (Puerto 80)..."
netsh advfirewall firewall delete rule name="$apacheRuleName" | Out-Null
netsh advfirewall firewall add rule name="$apacheRuleName" dir=in action=allow protocol=TCP localport=80
Write-Host "✅ Regla '$apacheRuleName' agregada." -ForegroundColor Green

# Rule for Vite (Port 5173)
$viteRuleName = "Allow Vite Dev Server Port 5173"
Write-Host "Configurando regla para Vite (Puerto 5173)..."
netsh advfirewall firewall delete rule name="$viteRuleName" | Out-Null
netsh advfirewall firewall add rule name="$viteRuleName" dir=in action=allow protocol=TCP localport=5173
Write-Host "✅ Regla '$viteRuleName' agregada." -ForegroundColor Green

Write-Host "`n🚀  ¡Listo! Los puertos han sido abiertos. Intenta conectar tu celular ahora." -ForegroundColor Cyan
Write-Host "Asegúrate de que tu celular esté en la misma red Wi-Fi que esta PC."
Pause
