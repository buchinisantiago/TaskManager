@echo off
TITLE Iniciando App de Tareas
echo ==================================================
echo      INICIANDO TU APP DE TAREAS (CLIENTE)
echo ==================================================
echo.
echo 1. Asegurate de que XAMPP (Apache y MySQL) esten encendidos (en verde).
echo 2. Iniciando servidor de desarrollo...
echo.
cd /d c:\xampp\htdocs\APP-Prueba\task-manager\client
call npm run dev
pause
