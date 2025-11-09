@echo off
echo ========================================
echo DEPLOY TO PRODUCTION
echo ========================================
echo.
cd "D:\Aplikasi Develop\E-Raport SD Ver 1.0"
echo [1/3] Adding changes...
git add .
echo.
echo [2/3] Committing...
set commit_msg=update: %date% %time%
git commit -m "%commit_msg%"
if errorlevel 1 (
    echo.
    echo No changes to commit
    pause
    exit /b
)
echo.
echo [3/3] Pushing to main...
git push origin main
if errorlevel 1 (
    echo.
    echo Push failed!
    pause
    exit /b
)
echo.
echo ========================================
echo DONE! Vercel auto-deploying...
echo Check: https://administrasi-sdn-pasirpogor.vercel.app
echo ========================================
pause