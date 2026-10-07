@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo No se encontro Node.js. Instala Node.js 22 y vuelve a abrir este archivo.
  pause
  exit /b 1
)
if not exist .env copy .env.example .env >nul
node scripts/dev.mjs
pause
