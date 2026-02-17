# 📦 Guía de Migración a Nueva PC

## 🎯 Qué Necesitás Llevar

Para que funcione en la nueva PC necesitás:

1. ✅ Todo el código de la aplicación
2. ✅ La base de datos exportada
3. ✅ Configuración de ngrok
4. ✅ Google Apps Script (ya está en la nube)

---

## 📋 Checklist Pre-Migración (Hacer en PC ACTUAL)

### 1. Exportar Base de Datos

1. Abre phpMyAdmin: `http://localhost/phpmyadmin`
2. Selecciona la base de datos `task_manager`
3. Click en **"Exportar"**
4. Selecciona **"Rápido"** y formato **SQL**
5. Click en **"Continuar"**
6. Guarda el archivo como `task_manager_backup.sql`
7. **Cópialo** a: `c:\xampp\htdocs\APP-Prueba\task-manager\server\`

### 2. Copiar Carpeta Completa

Copia toda la carpeta:
```
c:\xampp\htdocs\APP-Prueba
```

A una USB, Google Drive, o cualquier lugar seguro.

### 3. Anotar Configuración de ngrok

Si tenés cuenta de ngrok:
- Tu authtoken está en: `C:\Users\TU_USUARIO\.ngrok2\ngrok.yml`
- Copia ese archivo también

---

## 🚀 Setup en PC NUEVA

### Paso 1: Instalar Requisitos

1. **XAMPP**: https://www.apachefriends.org/download.html
2. **Node.js**: https://nodejs.org (para el frontend)
3. **ngrok**: https://ngrok.com/download
   - O vía Microsoft Store

### Paso 2: Restaurar Archivos

1. Copia la carpeta `APP-Prueba` a `c:\xampp\htdocs\`

### Paso 3: Importar Base de Datos

1. Inicia XAMPP (Apache + MySQL)
2. Abre phpMyAdmin: `http://localhost/phpmyadmin`
3. Click en **"Nueva"** → Crear base de datos `task_manager`
4. Selecciona `task_manager`
5. Click en **"Importar"**
6. Click en **"Seleccionar archivo"**
7. Busca `task_manager_backup.sql`
8. Click en **"Continuar"**

### Paso 4: Configurar ngrok

```powershell
cd C:\ngrok
ngrok config add-authtoken TU_TOKEN_AQUI
ngrok http 80 --host-header=rewrite
```

**Copia el nuevo URL** (probablemente sea diferente)

### Paso 5: Actualizar Google Apps Script

1. Ve a https://script.google.com
2. Abre tu proyecto "Task Manager Email"
3. **Actualiza línea 14** con el nuevo URL de ngrok
4. En **línea 72**, asegurate de tener:
```javascript
const response = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    headers: {
        'ngrok-skip-browser-warning': 'true'
    }
});
```
5. Guarda

### Paso 6: Probar

1. Ejecuta `testEmailNow` en Google Apps Script
2. Verifica que llegue el email

### Paso 7: Instalar Dependencias del Frontend

```powershell
cd c:\xampp\htdocs\APP-Prueba\task-manager\client
npm install
npm run dev
```

---

## ✅ Verificación Completa

- [ ] XAMPP corriendo (Apache verde, MySQL verde)
- [ ] Base de datos importada con tus tareas
- [ ] ngrok corriendo
- [ ] Google Apps Script actualizado con nuevo URL
- [ ] Email de prueba funcionando
- [ ] Frontend corriendo en localhost:5173

---

## 📝 Archivo de Configuración Rápida

He creado un archivo `MIGRACION_RAPIDA.txt` con todos los comandos que necesitás ejecutar en orden.

---

## ⚠️ Notas Importantes

1. **El URL de ngrok cambiará** en la nueva PC
2. **Los triggers de Google Apps Script** se mantienen (están en la nube)
3. **NO necesitás reinstalar nada en Google Apps Script**, solo actualizar el URL

---

## 🎯 Tiempo Estimado de Migración

- Instalación de software: 15-20 min
- Copia de archivos: 5 min
- Importación de BD: 2 min
- Configuración ngrok + Apps Script: 5 min
- **Total**: ~30-35 minutos

---

¿Querés que cree también un script automatizado de backup?
