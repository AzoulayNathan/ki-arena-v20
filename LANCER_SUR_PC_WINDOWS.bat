@echo off
setlocal
cd /d "%~dp0"
if not exist "JOUER_KI_ARENA_V23.html" goto missing
where node >nul 2>nul
if errorlevel 1 goto standalone
echo KI ARENA 23 - serveur local. Laissez cette fenetre ouverte.
node scripts\local-server-v19.mjs
if errorlevel 1 goto server_error
exit /b 0
:standalone
start "" "%~dp0JOUER_KI_ARENA_V23.html"
exit /b %errorlevel%
:missing
echo Extraire tout le ZIP avant de lancer. Fichier HTML absent.
pause
exit /b 1
:server_error
echo Le serveur n'a pas demarre. Fermez une ancienne fenetre KI ARENA si le port est occupe.
echo Vous pouvez aussi ouvrir JOUER_KI_ARENA_V23.html directement.
pause
exit /b 1
