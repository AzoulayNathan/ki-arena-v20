@echo off
cd /d "%~dp0"
if not exist "JOUER_KI_ARENA_V19.html" (
 echo Extraire tout le ZIP avant de lancer.
 pause
 exit /b 1
)
start "" "%~dp0JOUER_KI_ARENA_V19.html"
