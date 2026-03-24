@echo off
chcp 65001 >nul

echo ====================================
echo likeadmin Windows 重启服务
echo ====================================
echo.

echo [1/2] 停止服务...
call "%~dp0stop.bat"
echo.

echo [2/2] 启动服务...
call "%~dp0start.bat"
echo.

echo === 重启完成 ===

pause
