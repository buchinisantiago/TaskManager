@echo off
TITLE Ngrok Task Manager - NO CERRAR
COLOR 0A

echo ========================================================
echo   INICIANDO NGROK AUTOMATICAMENTE
echo ========================================================
echo.
echo   Este script mantiene tu Task Manager conectado a internet.
echo   IMPORTANTE: Si reinicias la PC, el URL de abajo puede cambiar.
echo   Si cambia, actualizalo en Google Apps Script.
echo.
echo   Iniciando comando: ngrok http 80 --host-header=rewrite
echo.
echo ========================================================
echo.

REM Ejecutar ngrok
ngrok http 80 --host-header=rewrite

REM Si ngrok se cierra por error, pausa para ver el mensaje
pause
