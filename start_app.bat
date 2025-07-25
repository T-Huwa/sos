@echo off
REM Get current script directory (Windows path)
set "WIN_DIR=%~dp0"

REM Convert to WSL path
for /f "delims=" %%i in ('wsl wslpath "%WIN_DIR%"') do set "WSL_DIR=%%i"

REM Clear cache and ensure storage is properly linked
wsl -e bash -c "cd %WSL_DIR% && php artisan cache:clear && php artisan config:clear"
wsl -e bash -c "cd %WSL_DIR% && rm -f public/storage && php artisan storage:link"
wsl -e bash -c "cd %WSL_DIR% && chmod -R 755 storage && chmod -R 755 public/storage"

REM Start Laravel server in new terminal
start wt -w 0 wsl -e bash -c "cd %WSL_DIR% && php artisan serve"

REM Start frontend dev server (e.g., Vite/Next.js) in another terminal
start wt -w 0 wsl -e bash -c "cd %WSL_DIR% && npm run dev"

echo Servers starting from %WSL_DIR% ...

