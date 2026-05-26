@echo off
title DailyPay Finance Expo Go Setup
echo ===================================================
echo DailyPay Finance - Expo Go Setup Helper
echo ===================================================
echo.

:: Check Node.js
where node >nul 2>nul
if errorlevel 1 goto install_node
goto node_exists

:install_node
echo [WARNING] Node.js is NOT installed on your computer.
echo.
echo We will try to install it automatically using Windows Package Manager (winget)...
echo.
winget install OpenJS.NodeJS.22 --accept-source-agreements --accept-package-agreements
if errorlevel 1 goto install_failed

echo.
echo [SUCCESS] Node.js has been installed!
echo.
echo IMPORTANT: Please CLOSE this command prompt window,
echo open a NEW command prompt, and run this script again.
echo.
pause
exit /b

:install_failed
echo.
echo [ERROR] Automatic installation failed.
echo Please download and install Node.js manually from:
echo https://nodejs.org/en/download/
echo.
echo After installing, reopen this command prompt and run this script again.
echo.
pause
exit /b

:node_exists
:: Node is installed, check version
for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
echo [INFO] Node.js found: %NODE_VER%
echo.

:: Change directory to dailypay-expo
cd /d "C:\Users\tuppa\.gemini\antigravity\scratch\dailypay-expo"
if errorlevel 1 goto no_folder

:: Run npm install
echo [INFO] Installing project dependencies (this may take a minute)...
call npm install
if errorlevel 1 goto npm_failed

echo.
echo [SUCCESS] Dependencies installed!
echo.
echo ===================================================
echo Select Connection Mode:
echo ===================================================
echo [1] LAN Mode - Auto IP (Fastest, requires PC/Phone on same Wi-Fi)
echo [2] LAN Mode - Manual IP (Use this if Auto IP binds to virtual adapters)
echo [3] Tunnel Mode (Works on any network, but can time out)
echo ===================================================
echo.
set /p CHOICE="Enter option (1, 2, or 3, default is 1): "

if "%CHOICE%"=="2" goto manual_lan
if "%CHOICE%"=="3" goto start_tunnel
goto start_lan

:manual_lan
echo.
echo To find your PC's IP address:
echo 1. Open a separate Command Prompt and run: ipconfig
echo 2. Look for "IPv4 Address" under "Wireless LAN adapter Wi-Fi" (usually starts with 192.168.x.x)
echo.
set /p USER_IP="Enter your PC's Wi-Fi IP Address: "
if "%USER_IP%"=="" goto start_lan
echo Setting packager host to %USER_IP%...
set REACT_NATIVE_PACKAGER_HOSTNAME=%USER_IP%
goto start_lan

:start_tunnel
echo Starting Expo in Tunnel Mode...
call npx expo start --tunnel
pause
exit /b

:start_lan
echo Starting Expo in LAN Mode...
call npx expo start
pause
exit /b

:no_folder
echo [ERROR] Could not find the dailypay-expo folder at C:\Users\tuppa\.gemini\antigravity\scratch\dailypay-expo.
pause
exit /b

:npm_failed
echo.
echo [ERROR] npm install failed.
echo Please make sure you have internet access and try again.
pause
exit /b
