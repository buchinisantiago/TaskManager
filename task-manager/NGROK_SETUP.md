# 🎯 Guía Visual: Ejecutar ngrok en Windows

## Ya tenés tu authtoken copiado (ej: 2abc123def456...)

---

## 📝 PASO A PASO - Ejecutar en PowerShell

### 1️⃣ Abrir PowerShell

**Opción más fácil:**
- Presiona `Windows + R`
- Escribe: `powershell`
- Presiona `Enter`

Se abre una ventana azul (PowerShell)

---

### 2️⃣ Ir a la carpeta de ngrok

En PowerShell, escribe y presiona Enter:

```powershell
cd C:\ngrok
```

Si ngrok está en otro lado, usa esa ruta. Si lo instalaste desde Microsoft Store, prueba:

```powershell
cd C:\Users\TU_USUARIO\AppData\Local\Microsoft\WindowsApps
```

---

### 3️⃣ Verificar que ngrok funciona

Ejecuta:

```powershell
ngrok version
```

Debería mostrar algo como: `ngrok version 3.x.x`

---

### 4️⃣ Configurar el authtoken

**IMPORTANTE:** Reemplaza `TU_TOKEN_AQUI` con el token que copiaste de la web de ngrok.

Ejecuta:

```powershell
ngrok config add-authtoken 2abc123def456ghi789jkl
```

(Usa tu token real, no ese de ejemplo)

Deberías ver:
```
Authtoken saved to configuration file: C:\Users\...\.ngrok2\ngrok.yml
```

---

### 5️⃣ Iniciar el túnel

Ejecuta:

```powershell
ngrok http 80
```

---

### 6️⃣ COPIAR EL URL

Verás una pantalla como esta:

```
ngrok

Session Status                online
Account                       tu_email@gmail.com
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:80

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**COPIA** el URL que dice `Forwarding`: 
```
https://abc123.ngrok-free.app
```

---

## ✅ Ese es tu URL público

Ahora:

1. **Deja PowerShell abierto** (no lo cierres, ngrok debe seguir corriendo)
2. Usa ese URL en Google Apps Script
3. Prueba que funcione abriendo en tu navegador:
   ```
   https://abc123.ngrok-free.app/APP-Prueba/task-manager/server/public/api/daily-summary.php?token=tu_token_secreto_aqui_123
   ```

---

## ⚠️ MUY IMPORTANTE

- **NO cierres la ventana de PowerShell** mientras quieras que funcione el email
- Si cierras PowerShell/ngrok, el URL cambia
- Dejá ngrok corriendo en segundo plano

---

## 🔄 Si ngrok está en Microsoft Store

Si instalaste desde Microsoft Store, ngrok está en:
```
C:\Users\TU_USUARIO\AppData\Local\Microsoft\WindowsApps
```

No necesitas hacer `cd`, solo ejecuta directamente:

```powershell
ngrok config add-authtoken TU_TOKEN
ngrok http 80
```

---

## 🎥 ¿Qué ejecuto y dónde?

| Lo que ves | Dónde ejecutar | ¿Qué hace? |
|------------|----------------|------------|
| `cd C:\ngrok` | PowerShell | Va a la carpeta de ngrok |
| `ngrok version` | PowerShell | Verifica que funciona |
| `ngrok config add-authtoken ...` | PowerShell | Guarda tu token |
| `ngrok http 80` | PowerShell | Inicia el túnel |
| Tu cuenta de Google | Navegador | Solo para obtener el token |

---

## 📸 Screenshot mental

```
┌─────────────────────────────────────┐
│ PowerShell                      - □ ×│
├─────────────────────────────────────┤
│ PS C:\Users\Cache> cd C:\ngrok     │
│ PS C:\ngrok> ngrok http 80         │
│                                     │
│ Forwarding https://abc123.ngrok-   │
│ free.app -> http://localhost:80    │
│                                     │
│ [Deja esta ventana abierta]        │
└─────────────────────────────────────┘
```

---

## 🆘 Si te sale error

**Error: "ngrok no se reconoce"**
- ngrok no está en el PATH
- Solución: Navega a la carpeta donde está ngrok con `cd`

**Error: "authentication failed"**
- El token está mal escrito
- Solución: Vuelve a copiar el token de ngrok.com

**Error: "address already in use"**
- Algo más está usando el puerto 80
- Solución: Cierra XAMPP temporalmente o usa otro puerto: `ngrok http 8080`

---

Decime si te trabás en algún paso específico y te ayudo en tiempo real!
