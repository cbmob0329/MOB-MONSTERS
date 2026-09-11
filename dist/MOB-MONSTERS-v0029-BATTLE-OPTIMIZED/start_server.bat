@echo off
cd /d "%~dp0"
echo MOB MONSTERS local server: http://localhost:8000/
python -m http.server 8000
pause
