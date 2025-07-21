@echo off
REM Get current script directory (Windows path)
set "WIN_DIR=%~dp0"

REM Convert to WSL path
for /f "delims=" %%i in ('wsl wslpath "%WIN_DIR%"') do set "WSL_DIR=%%i"

REM Run artisan storage:link
wsl -e bash -c "cd %WSL_DIR% && php artisan storage:link"

REM Start Laravel server in new terminal
start wt -w 0 wsl -e bash -c "cd %WSL_DIR% && php artisan serve"

REM Start frontend dev server (e.g., Vite/Next.js) in another terminal
start wt -w 0 wsl -e bash -c "cd %WSL_DIR% && npm run dev"

echo Servers starting from %WSL_DIR% ...

