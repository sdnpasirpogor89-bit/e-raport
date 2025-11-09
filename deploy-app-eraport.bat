@echo off
echo ========================================
echo DEPLOY TO PRODUCTION
echo ========================================
echo.
cd "D:\Aplikasi Develop\E-Raport SD Ver 1.0"
echo [1/4] Adding changes...
git add .
echo.
echo [2/4] Committing...
set commit_msg=update: %date% %time%
git commit -m "%commit_msg%"
if errorlevel 1 (
    echo.
    echo No changes to commit
    pause
    exit /b
)
echo.
echo [3/4] Pushing to main...
git push origin main
if errorlevel 1 (
    echo.
    echo Push failed!
    pause
    exit /b
)
echo.
echo [4/4] Deploying to Vercel...
vercel --prod
echo.
echo ========================================
echo DONE! Check your app:
echo https://e-raport-sdn1-pasirpogor.vercel.app
echo ========================================
pause