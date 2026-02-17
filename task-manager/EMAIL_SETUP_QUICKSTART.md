# ⚡ Configuración Rápida - Email Diario

## 📝 Checklist de 5 Minutos

### ✅ Paso 1: Configurar Token Secreto
En [`daily-summary.php`](file:///c:/xampp/htdocs/APP-Prueba/task-manager/server/public/api/daily-summary.php) línea 10:
```php
$SECRET_TOKEN = "miTokenSecreto123"; // Cambia esto por algo único
```

### ✅ Paso 2: Exponer tu API (ngrok)
```bash
# Descarga ngrok de https://ngrok.com/download
cd C:\ngrok
ngrok http 80
# Copia el URL que aparece (ej: https://abc123.ngrok-free.app)
```

### ✅ Paso 3: Probar Endpoint
Abre en navegador:
```
http://localhost/APP-Prueba/task-manager/server/public/api/daily-summary.php?token=miTokenSecreto123
```
Deberías ver JSON con tus tareas.

### ✅ Paso 4: Crear Google Apps Script
1. Ve a https://script.google.com
2. Nuevo proyecto → Pega código de [`google-apps-script.js`](file:///c:/xampp/htdocs/APP-Prueba/task-manager/server/scripts/google-apps-script.js)
3. Configura (líneas 15-21):
```javascript
EMAIL_TO: "tuEmail@gmail.com",
API_URL: "https://TU_URL_NGROK.ngrok-free.app/APP-Prueba/task-manager/server/public/api/daily-summary.php",
SECRET_TOKEN: "miTokenSecreto123", // Mismo que en PHP
```

### ✅ Paso 5: Probar
1. Selecciona función: `testEmailNow`
2. Click ▶️ Ejecutar
3. Autoriza permisos (primera vez)
4. Revisa tu Gmail

### ✅ Paso 6: Automatizar
1. Click en ⏰ Activadores
2. Añadir activador:
   - Función: `sendDailyTaskEmail`
   - Tipo: `Día`
   - Hora: `8-9 a.m.`
3. Guardar

## 🎉 ¡Listo!

Mañana a las 8 AM recibirás tu primer email automático.

---

## 📚 Guías Completas

- **Setup completo**: [`email_setup_guide.md`](file:///C:/Users/Cache/.gemini/antigravity/brain/44d3fcd8-76e5-4619-a51c-b103e4b234eb/email_setup_guide.md)
- **Código Google Script**: [`google-apps-script.js`](file:///c:/xampp/htdocs/APP-Prueba/task-manager/server/scripts/google-apps-script.js)
- **Endpoint PHP**: [`daily-summary.php`](file:///c:/xampp/htdocs/APP-Prueba/task-manager/server/public/api/daily-summary.php)

## ⚠️ Importante
- Deja **ngrok corriendo** (si lo cierras, el URL cambia)
- **XAMPP** debe estar encendido (Apache + MySQL)
- Si usas ngrok gratis, actualiza `API_URL` cada vez que lo reinicies
