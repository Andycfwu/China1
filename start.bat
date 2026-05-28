@echo off
setlocal
cd /d "%~dp0"

where docker >nul 2>nul
if errorlevel 1 (
  echo Docker Desktop is not installed or is not running.
  echo Install/start Docker Desktop, then run this file again.
  pause
  exit /b 1
)

if not exist .env.local (
  echo Missing .env.local. Add the restaurant configuration before starting China 1.
  pause
  exit /b 1
)

echo Starting China 1...
docker compose up -d
if errorlevel 1 (
  echo China 1 could not be started. See the Docker Desktop logs.
  pause
  exit /b 1
)

echo.
echo China 1 is running at http://localhost:3000
echo Printer status is available at http://localhost:3101/health
pause
