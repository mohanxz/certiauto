@echo off
cd /d %~dp0

echo Checking PM2 process...

pm2 describe certiauto >nul 2>&1

IF %ERRORLEVEL% EQU 0 (
    echo Certiauto exists. Restarting...
    pm2 restart certiauto
) ELSE (
    echo Certiauto not found. Starting new process...
    pm2 start dist/server.js --name certiauto
)

echo.
echo Done.
pause