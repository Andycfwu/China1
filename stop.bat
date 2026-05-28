@echo off
setlocal
cd /d "%~dp0"

where docker >nul 2>nul
if errorlevel 1 (
  echo Docker Desktop is not installed or is not running.
  pause
  exit /b 1
)

echo Stopping China 1...
docker compose down
if errorlevel 1 (
  echo China 1 could not be stopped. See the Docker Desktop logs.
  pause
  exit /b 1
)

echo China 1 has been stopped.
pause
