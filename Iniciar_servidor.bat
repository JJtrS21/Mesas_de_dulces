@echo off
REM === Ir a la carpeta donde está este archivo (.bat) ===
cd /d %~dp0

REM === Iniciar el servidor Node.js minimizado ===
start /min cmd /c "npm start"

REM === (opcional) Esperar unos segundos antes de cerrar la ventana ===
timeout /t 2 /nobreak >nul
exit