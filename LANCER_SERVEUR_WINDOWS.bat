@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Node.js 18+ requis pour le serveur uniquement.
 echo Jouer sans installation avec LANCER_SUR_PC_WINDOWS.bat
 pause
 exit /b 1
)
node scripts\local-server-v9.mjs
if errorlevel 1 pause
