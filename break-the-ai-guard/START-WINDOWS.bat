@echo off
title Break the AI Guard
cd /d "%~dp0"
where py >nul 2>nul && (py server.py) || (python server.py)
pause
