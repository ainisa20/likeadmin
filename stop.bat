@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ====================================
echo likeadmin Windows 停止服务
echo ====================================
echo.

echo [1/5] 检查正在运行的服务...
set PHP_RUNNING=0
set REDIS_RUNNING=0
set NGINX_RUNNING=0

tasklist /fi "imagename eq php-cgi.exe" 2>nul | findstr /i "php-cgi" >nul
if %errorlevel% equ 0 set PHP_RUNNING=1

tasklist /fi "imagename eq mysqld.exe" 2>nul | findstr /i "mysqld" >nul
if %errorlevel% equ 0 set REDIS_RUNNING=1

tasklist /fi "imagename eq nginx.exe" 2>nul | findstr /i "nginx" >nul
if %errorlevel% equ 0 set NGINX_RUNNING=1

if %PHP_RUNNING% equ 1 (echo   PHP-FPM: 运行中) else (echo   PHP-FPM: 未运行)
if %REDIS_RUNNING% equ 1 (echo   MySQL: 运行中) else (echo   MySQL: 未运行)
if %NGINX_RUNNING% equ 1 (echo   Nginx: 运行中) else (echo   Nginx: 未运行)

echo.
echo [2/5] 停止 PHP-FPM...
if %PHP_RUNNING% equ 1 (
    taskkill /f /im php-cgi.exe >nul 2>&1
    echo   √ PHP-FPM 已停止
) else (
    echo   √ PHP-FPM 未运行
)

echo.
echo [3/5] 停止 MySQL...
if %REDIS_RUNNING% equ 1 (
    net stop MySQL >nul 2>&1
    echo   √ MySQL 已停止
) else (
    echo   √ MySQL 未运行
)

echo.
echo [4/5] 停止 Nginx...
if %NGINX_RUNNING% equ 1 (
    taskkill /f /im nginx.exe >nul 2>&1
    echo   √ Nginx 已停止
) else (
    echo   √ Nginx 未运行
)

echo.
echo [5/5] 验证服务状态...
set REMAINING=0

tasklist /fi "imagename eq php-cgi.exe" 2>nul | findstr /i "php-cgi" >nul
if %errorlevel% equ 0 (echo   ✗ PHP-FPM 仍在运行 & set /a REMAINING+=1)

tasklist /fi "imagename eq mysqld.exe" 2>nul | findstr /i "mysqld" >nul
if %errorlevel% equ 0 (echo   ✗ MySQL 仍在运行 & set /a REMAINING+=1)

tasklist /fi "imagename eq nginx.exe" 2>nul | findstr /i "nginx" >nul
if %errorlevel% equ 0 (echo   ✗ Nginx 仍在运行 & set /a REMAINING+=1)

if %REMAINING% equ 0 echo   √ 所有服务已完全停止

echo.
if %REMAINING% equ 0 (
    echo === 所有服务已成功停止 ===
) else (
    echo === 部分服务停止失败 ===
)

pause
