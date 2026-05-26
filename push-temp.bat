@echo off
echo ==============================================
echo Installing Git (if not already installed)...
echo ==============================================
winget install Git.Git --accept-source-agreements --accept-package-agreements

set GIT_PATH="C:\Program Files\Git\cmd\git.exe"

echo ==============================================
echo Initializing Git repository...
echo ==============================================
cd /d "C:\Users\tuppa\.gemini\antigravity\scratch"

:: Create .gitignore
(
echo dailypay-expo/node_modules/
echo dailypay-expo/.expo/
echo .system_generated/
echo scratch/
echo *.log
) > .gitignore

%GIT_PATH% init -b main
%GIT_PATH% config user.name "T-Udaykiran"
%GIT_PATH% config user.email "t-udaykiran@users.noreply.github.com"
%GIT_PATH% add .
%GIT_PATH% commit -m "Initial commit: DailyPay Finance Web & Expo Go application"
%GIT_PATH% remote remove origin >nul 2>nul
%GIT_PATH% remote add origin https://github.com/T-Udaykiran/DailyPayFin.git
%GIT_PATH% branch -M main

echo ==============================================
echo Pushing to GitHub...
echo (A GitHub login window will pop up. Please authenticate to complete the push!)
echo ==============================================
%GIT_PATH% push -u origin main -f
