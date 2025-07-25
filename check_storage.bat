@echo off
REM Check and fix storage link issues

REM Get current script directory (Windows path)
set "WIN_DIR=%~dp0"

REM Convert to WSL path
for /f "delims=" %%i in ('wsl wslpath "%WIN_DIR%"') do set "WSL_DIR=%%i"

echo Checking storage configuration...

REM Check if storage link exists
wsl -e bash -c "cd %WSL_DIR% && ls -la public/storage"

REM Remove existing storage link if it exists
wsl -e bash -c "cd %WSL_DIR% && rm -f public/storage"

REM Create fresh storage link
wsl -e bash -c "cd %WSL_DIR% && php artisan storage:link"

REM Set proper permissions
wsl -e bash -c "cd %WSL_DIR% && chmod -R 755 storage && chmod -R 755 public/storage"

REM Clear cache
wsl -e bash -c "cd %WSL_DIR% && php artisan cache:clear && php artisan config:clear"

echo Storage configuration completed!
pause
