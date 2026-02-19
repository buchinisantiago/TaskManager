# Guía de Despliegue: Task Manager (PostgreSQL + Render)

Esta guía está personalizada para tu proyecto **Task Manager** (Frontend React + Backend PHP).

## 1. Preparación de la Base de Datos (Supabase)

1.  Crea un nuevo proyecto en [Supabase](https://supabase.com/).
2.  Ve a **Project Settings -> Database -> Connection Pooling**.
3.  Copia la **Connection String (URI)** (Mode: Session, Port: 6543).
    *   Ejemplo: `postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`
    *   **Guarda este valor**, lo usarás en Render.
4.  Ve al **SQL Editor** en Supabase.
5.  Abre el archivo `server/schema_postgres.sql` que he creado para ti.
6.  Copia su contenido y ejecútalo en el SQL Editor de Supabase. Esto creará las tablas `usuarios` y `tareas` compatibles con PostgreSQL.

## 2. Preparación del Código (GitHub)

1.  Sube la carpeta `task-manager` a un nuevo repositorio de GitHub.
    *   **Opción A (Recomendada):** Inicializa el repo *DENTRO* de la carpeta `task-manager` para que sea la raíz.
    *   **Opción B:** Si subes todo `APP-Prueba`, deberás configurar el "Root Directory" en Render como `task-manager`.

## 3. Despliegue en Render

1.  Crea un nuevo **Web Service** en [Render](https://dashboard.render.com/).
2.  Conecta tu repositorio.
3.  **Runtime**: Selecciona **Docker**.
4.  **Root Directory**: 
    *   Si usaste Opción A: Déjalo en blanco.
    *   Si usaste Opción B: Escribe `task-manager`.
5.  **Environment Variables**:
    Añade la siguiente variable:
    *   Key: `DATABASE_URL`
    *   Value: (Pega aquí la Connection String de Supabase que copiaste en el paso 1)
6.  Haz clic en **Create Web Service**.

Render detectará automáticamente el `Dockerfile`, construirá el Frontend (React/Vite) y configurará el Backend (PHP/Apache).

## 4. Notas Importantes

*   **Frontend y Backend Unificados:** He configurado el servidor para servir tanto la API (en `/api/tasks`) como la aplicación React (en `/`).
*   **Docker Multi-Stage:** El Dockerfile compila automáticamente el código de React antes de iniciar el servidor PHP. No necesitas subir la carpeta `dist` manualmente.
*   **Modo Local:** Tu entorno local (XAMPP + Vite) seguirá funcionando normalmente. La aplicación detecta automáticamente si está en Local o Producción para usar la URL correcta de la API.
