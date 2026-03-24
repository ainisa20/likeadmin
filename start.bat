@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ====================================
echo likeadmin Windows 启动脚本
echo ====================================
echo.

:: 获取脚本所在目录
set "SCRIPT_DIR=%~dp0"
set "BASE_DIR=%SCRIPT_DIR%"
set "SERVER_DIR=%BASE_DIR%server"

echo [1/6] 检查 MySQL 数据库...
:: 检查 MySQL 是否运行 (Windows)
net start | findstr /i "mysql" >nul
if %errorlevel% equ 0 (
    echo   √ MySQL 已运行
) else (
    echo   → 尝试启动 MySQL...
    net start MySQL 2>nul
    if %errorlevel% equ 0 (
        echo   √ MySQL 已启动
    ) else (
        echo   ! 请确保已安装 MySQL (如 XAMPP/WAMP)
    )
)

echo.
echo [2/6] 检查配置文件...
if not exist "%SERVER_DIR%\.env" (
    if exist "%SERVER_DIR%\.example.env" (
        copy "%SERVER_DIR%\.example.env" "%SERVER_DIR%\.env" >nul
        echo   √ 已复制 .env 配置文件
    ) else (
        echo   ! .env 和 .example.env 都不存在
    )
) else (
    echo   √ .env 已存在
)

echo.
echo [3/6] 检查 PHP 扩展...
php -m | findstr /i "pdo_mysql" >nul && echo   √ pdo_mysql || echo   ✗ pdo_mysql 未安装
php -m | findstr /i "mbstring" >nul && echo   √ mbstring || echo   ✗ mbstring 未安装
php -m | findstr /i "curl" >nul && echo   √ curl || echo   ✗ curl 未安装
php -m | findstr /i "json" >nul && echo   √ json || echo   ✗ json 未安装

echo.
echo [4/7] 检查 Node.js 版本...
for /f "tokens=*" %%i in ('node -v 2^>nul') do set NODE_VERSION=%%i
echo %NODE_VERSION% | findstr /i "v20" >nul
if %errorlevel% equ 0 (
    echo   √ Node.js 版本: %NODE_VERSION%
) else (
    echo   ✗ Node.js 版本不正确: %NODE_VERSION% (需要 v20.x)
    echo   → 请安装 Node.js 20: https://nodejs.org/
)

echo.
echo [5/7] 检查 PC 端构建...
if exist "%BASE_DIR%server\public\pc\index.html" (
    echo   √ PC 端已构建
) else (
    echo   → PC 端未构建，需要先在 Linux/Mac 构建
    echo   → 或者在 Windows 安装 Node.js 20 后执行:
    echo   →   cd %BASE_DIR%pc
    echo   →   npm install
    echo   →   npm run build
)

echo.
echo [6/7] 配置 nginx...
:: Windows 下使用 XAMPP/WAMP 的 nginx
set "NGINX_DIR=C:\xampp\nginx"
if not exist "%NGINX_DIR%" (
    set "NGINX_DIR=C:\wamp64\bin\apache\apache2.4.51"
    if not exist "%NGINX_DIR%" (
        echo   ! 未找到 nginx，请安装 XAMPP/WAMP
    )
)

if exist "%NGINX_DIR%" (
    echo   √ 找到 nginx: %NGINX_DIR%
    :: 生成 nginx 配置
    (
        echo server ^{
        echo     listen 8088;
        echo     server_name localhost;
        echo     root %SERVER_DIR%\\public;
        echo     index index.php index.html;
        echo.
        echo     client_max_body_size 10M;
        echo.
        echo     location /adminapi/ ^{
        echo         fastcgi_pass 127.0.0.1:9000;
        echo         fastcgi_index index.php;
        echo         fastcgi_param SCRIPT_FILENAME %SERVER_DIR%\\public\\index.php;
        echo         fastcgi_param REQUEST_URI $request_uri;
        echo         fastcgi_param PATH_INFO $fastcgi_script_name;
        echo         include fastcgi_params;
        echo     ^}
        echo.
        echo     location /api/ ^{
        echo         fastcgi_pass 127.0.0.1:9000;
        echo         fastcgi_index index.php;
        echo         fastcgi_param SCRIPT_FILENAME %SERVER_DIR%\\public\\index.php;
        echo         fastcgi_param REQUEST_URI $request_uri;
        echo         fastcgi_param PATH_INFO $fastcgi_script_name;
        echo         include fastcgi_params;
        echo     ^}
        echo.
        echo     location /admin ^{
        echo         try_files $uri $uri/ /admin/index.html;
        echo     ^}
        echo.
        echo     location /mobile ^{
        echo         try_files $uri $uri/ /mobile/index.html;
        echo     ^}
        echo.
        echo     location /pc ^{
        echo         try_files $uri $uri/ /pc/index.html;
        echo     ^}
        echo.
        echo     location / ^{
        echo         try_files $uri $uri/ /index.php?$query_string;
        echo     ^}
        echo.
        echo     location ~ \.php(/^|$) ^{
        echo         fastcgi_pass 127.0.0.1:9000;
        echo         fastcgi_index index.php;
        echo         fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        echo         include fastcgi_params;
        echo     ^}
        echo.
        echo     location ~ /\.ht ^{
        echo         deny all;
        echo     ^}
        echo ^}
    ) > "%NGINX_DIR%\conf\extra\likeadmin.conf"
    echo   √ nginx 配置已生成
)

echo.
echo [7/7] 启动服务...

:: 检查并启动 MySQL
net start | findstr /i "mysql" >nul
if %errorlevel% neq 0 (
    echo   → 启动 MySQL...
    net start MySQL 2>nul
)

:: 检查并启动 nginx
if exist "%NGINX_DIR%\nginx.exe" (
    tasklist /fi "imagename eq nginx.exe" | findstr /i "nginx" >nul
    if %errorlevel% neq 0 (
        start /b "%NGINX_DIR%\nginx.exe"
        echo   √ nginx 已启动
    ) else (
        echo   √ nginx 已运行
    )
)

:: PHP-FPM 在 Windows 通常集成在 Apache 中，不需要单独启动
echo   √ PHP (通过 Apache/nginx) 已运行

echo.
echo ====================================
echo [完成] 所有服务已启动!
echo.
echo === 访问地址 ===
echo   安装程序: http://127.0.0.1:8088
echo   管理后台: http://127.0.0.1:8088/admin/login
echo   PC前台:   http://127.0.0.1:8088/pc/
echo   手机端:   http://127.0.0.1:8088/mobile/
echo.
echo   默认账号: admin
echo   默认密码: m123456@
echo.
echo === 常用命令 ===
echo   停止: stop.bat
echo   重启: restart.bat
echo ====================================

pause
