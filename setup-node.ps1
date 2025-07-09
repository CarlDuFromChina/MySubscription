# Node.js 14.x 安装和设置脚本

Write-Host "=== MySubscription Node.js 环境设置 ===" -ForegroundColor Green
Write-Host ""

# 检查当前 Node.js 版本
$currentVersion = ""
try {
    $currentVersion = node --version
    Write-Host "当前 Node.js 版本: $currentVersion" -ForegroundColor Yellow
} catch {
    Write-Host "未检测到 Node.js" -ForegroundColor Red
}

# 检查是否安装了 nvm-windows
$nvmInstalled = $false
try {
    nvm version | Out-Null
    $nvmInstalled = $true
    Write-Host "检测到 nvm-windows" -ForegroundColor Green
} catch {
    Write-Host "未检测到 nvm-windows" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "本项目需要 Node.js 14.x 版本" -ForegroundColor Cyan
Write-Host ""

if ($nvmInstalled) {
    Write-Host "使用 nvm-windows 安装 Node.js 14.21.3:" -ForegroundColor Green
    Write-Host "1. nvm install 14.21.3" -ForegroundColor White
    Write-Host "2. nvm use 14.21.3" -ForegroundColor White
    Write-Host ""
    
    $response = Read-Host "是否现在安装 Node.js 14.21.3? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "正在安装 Node.js 14.21.3..." -ForegroundColor Green
        nvm install 14.21.3
        nvm use 14.21.3
        Write-Host "安装完成！" -ForegroundColor Green
        
        # 验证安装
        $newVersion = node --version
        Write-Host "新的 Node.js 版本: $newVersion" -ForegroundColor Green
    }
} else {
    Write-Host "推荐安装 nvm-windows 来管理 Node.js 版本:" -ForegroundColor Yellow
    Write-Host "1. 访问: https://github.com/coreybutler/nvm-windows/releases" -ForegroundColor White
    Write-Host "2. 下载并安装 nvm-setup.zip" -ForegroundColor White
    Write-Host "3. 重新打开 PowerShell" -ForegroundColor White
    Write-Host "4. 运行: nvm install 14.21.3 && nvm use 14.21.3" -ForegroundColor White
    Write-Host ""
    Write-Host "或者直接下载 Node.js 14.21.3:" -ForegroundColor Yellow
    Write-Host "https://nodejs.org/download/release/v14.21.3/" -ForegroundColor White
}

Write-Host ""
Write-Host "安装完成后，运行以下命令验证:" -ForegroundColor Cyan
Write-Host "node --version" -ForegroundColor White
Write-Host "npm install" -ForegroundColor White
Write-Host ""
