@echo off
echo === MySubscription Node.js 环境设置 ===
echo.

REM 检查当前 Node.js 版本
node --version >nul 2>&1
if %errorlevel% == 0 (
    echo 当前 Node.js 版本:
    node --version
) else (
    echo 未检测到 Node.js
)

echo.
echo 本项目需要 Node.js 14.x 版本
echo.

REM 检查是否安装了 nvm-windows
nvm version >nul 2>&1
if %errorlevel% == 0 (
    echo 检测到 nvm-windows
    echo.
    echo 使用 nvm-windows 安装 Node.js 14.21.3:
    echo 1. nvm install 14.21.3
    echo 2. nvm use 14.21.3
    echo.
    set /p response="是否现在安装 Node.js 14.21.3? (y/N): "
    if /i "%response%" == "y" (
        echo 正在安装 Node.js 14.21.3...
        nvm install 14.21.3
        nvm use 14.21.3
        echo 安装完成！
        echo 新的 Node.js 版本:
        node --version
    )
) else (
    echo 未检测到 nvm-windows
    echo.
    echo 推荐安装 nvm-windows 来管理 Node.js 版本:
    echo 1. 访问: https://github.com/coreybutler/nvm-windows/releases
    echo 2. 下载并安装 nvm-setup.zip
    echo 3. 重新打开命令提示符
    echo 4. 运行: nvm install 14.21.3 ^&^& nvm use 14.21.3
    echo.
    echo 或者直接下载 Node.js 14.21.3:
    echo https://nodejs.org/download/release/v14.21.3/
)

echo.
echo 安装完成后，运行以下命令验证:
echo node --version
echo npm install
echo.
pause
