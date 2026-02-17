@echo off
REM =========================================
REM Script de Backup - Task Manager
REM Ejecuta este script ANTES de migrar
REM =========================================

echo.
echo ========================================
echo   BACKUP TASK MANAGER
echo ========================================
echo.

REM Crear carpeta de backup con fecha
set FECHA=%date:~-4,4%%date:~-7,2%%date:~-10,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set FECHA=%FECHA: =0%
set BACKUP_DIR=C:\TaskManager_Backup_%FECHA%

echo Creando carpeta de backup: %BACKUP_DIR%
mkdir "%BACKUP_DIR%"

echo.
echo 1. Exportando base de datos...
echo    (Se abrira phpMyAdmin - exporta manualmente task_manager)
start http://localhost/phpmyadmin

echo.
echo 2. Esperando 10 segundos para que exportes la BD...
timeout /t 10 /nobreak

echo.
echo 3. Copiando archivos de la aplicacion...
xcopy "C:\xampp\htdocs\APP-Prueba" "%BACKUP_DIR%\APP-Prueba\" /E /I /Y

echo.
echo 4. Copiando configuracion de ngrok...
if exist "%USERPROFILE%\.ngrok2\ngrok.yml" (
    copy "%USERPROFILE%\.ngrok2\ngrok.yml" "%BACKUP_DIR%\" /Y
    echo    Configuracion de ngrok copiada
) else (
    echo    Ngrok config no encontrado (OK si es primera vez)
)

echo.
echo ========================================
echo   BACKUP COMPLETADO
echo ========================================
echo.
echo Archivos guardados en:
echo %BACKUP_DIR%
echo.
echo IMPORTANTE:
echo 1. Copia manualmente task_manager_backup.sql a esta carpeta
echo 2. Copia toda la carpeta a USB o nube
echo 3. En la nueva PC, sigue MIGRACION_RAPIDA.txt
echo.
pause
