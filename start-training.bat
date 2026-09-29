@echo off
cd /d "%~dp0"
echo Starting AI Validation Engineer Academy on http://localhost:8420 ...
start "" http://localhost:8420/index.html
python server.py
