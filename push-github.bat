@echo off
title Push DailyPay Finance to GitHub
echo ===================================================
echo Push DailyPay Finance to GitHub
echo ===================================================
echo.

:: Check Git
where git >nul 2>nul
if errorlevel 1 goto install_git
goto git_exists

:install_git
echo [WARNING] Git is NOT installed on your computer.
echo.
echo We will try to install it automatically using Windows Package Manager (winget)...
echo.
winget install Git.Git --accept-source-agreements --accept-package-agreements
if errorlevel 1 goto install_failed

echo.
echo [SUCCESS] Git has been installed!
echo.
echo IMPORTANT: Please CLOSE this command prompt window,
echo open a NEW command prompt, and run this script again.
echo.
pause
exit /b

:install_failed
echo.
echo [ERROR] Automatic installation failed.
echo Please download and install Git manually from:
echo https://git-scm.com/download/win
echo.
echo After installing, reopen this command prompt and run this script again.
echo.
pause
exit /b

:git_exists
echo [INFO] Git is installed.
echo.

:: Change directory to scratch folder
cd /d "C:\Users\tuppa\.gemini\antigravity\scratch"

:: Initialize Git if not already done
if not exist .git (
    echo [INFO] Initializing Git repository...
    git init -b main
) else (
    echo [INFO] Git repository already initialized.
)

:: Create a .gitignore file to avoid pushing node_modules and logs
if not exist .gitignore (
    echo Creating .gitignore file...
    (
        echo dailypay-expo/node_modules/
        echo dailypay-expo/.expo/
        echo .system_generated/
        echo scratch/
        echo *.log
    ) > .gitignore
)

:: Add files
echo [INFO] Staging files...
git add .

:: Commit
echo [INFO] Committing files...
git commit -m "Initial commit: DailyPay Finance Web & Expo Go application"

echo.
echo ===================================================
echo GitHub Remote Settings
echo ===================================================
echo 1. Go to https://github.com and create a NEW blank repository.
echo 2. Do NOT add a README, license, or .gitignore when creating it.
echo 3. Copy the repository HTTPS URL (looks like https://github.com/username/reponame.git).
echo ===================================================
echo.

:get_url
set /p REPO_URL="Paste your GitHub Repository URL: "
if "%REPO_URL%"=="" (
    echo Repository URL cannot be empty!
    goto get_url
)

:: Set remote URL
git remote remove origin >nul 2>nul
git remote add origin %REPO_URL%

echo.
echo [INFO] Pushing files to main branch...
echo (If prompted, please log into your GitHub account in the popup window)
echo.

git push -u origin main

if errorlevel 1 (
    echo.
    echo [ERROR] Push failed. 
    echo Please make sure your repository is empty and you have write permissions.
    pause
    exit /b
)

echo.
echo [SUCCESS] Your code has been successfully pushed to GitHub!
echo.
pause
exit /b
