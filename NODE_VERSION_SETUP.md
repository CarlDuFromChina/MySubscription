# Node.js 14.x 版本要求配置总结

本文档总结了为确保项目使用 Node.js 14.x 而进行的所有配置更改。

## 📁 新增文件

### 1. `.nvmrc`
- **位置**: 项目根目录
- **内容**: `14.21.3`
- **作用**: 指定项目所需的 Node.js 版本，支持 nvm 自动切换

### 2. `scripts/check-node-version.js`
- **位置**: 项目根目录的 scripts 文件夹
- **作用**: 自动检查当前 Node.js 版本是否符合要求
- **特点**: 不依赖外部包，使用原生 Node.js API

### 3. `backend/scripts/check-node-version.js`
- **位置**: backend 目录的 scripts 文件夹
- **作用**: 后端专用的 Node.js 版本检查脚本

### 4. `setup-node.ps1`
- **位置**: 项目根目录
- **作用**: Windows PowerShell 脚本，帮助用户安装正确的 Node.js 版本
- **功能**: 
  - 检测当前 Node.js 版本
  - 检测是否安装 nvm-windows
  - 提供安装指导
  - 支持自动安装（如果已安装 nvm-windows）

### 5. `setup-node.bat`
- **位置**: 项目根目录
- **作用**: Windows 批处理脚本，功能与 PowerShell 脚本类似
- **适用**: 不支持 PowerShell 的环境

## 📝 修改的文件

### 1. `package.json` (根目录)
**新增内容**:
```json
"engines": {
  "node": "14.x",
  "npm": ">=6.0.0"
}
```

**修改脚本**:
```json
"scripts": {
  "preinstall": "node scripts/check-node-version.js",
  "prebuild": "node scripts/check-node-version.js",
  "predev": "node scripts/check-node-version.js",
  // ...其他脚本保持不变
}
```

### 2. `backend/package.json`
**新增内容**:
```json
"engines": {
  "node": "14.x",
  "npm": ">=6.0.0"
}
```

**修改脚本**:
```json
"scripts": {
  "prestart": "node scripts/check-node-version.js",
  "predev": "node scripts/check-node-version.js",
  "pretest": "node scripts/check-node-version.js",
  // ...其他脚本保持不变
}
```

### 3. `appveyor.yml`
**修改内容**:
```yaml
install:
  - ps: Install-Product node 14 x64  # 从 node 8 改为 node 14
  - git reset --hard HEAD
  - yarn
  - node --version
```

### 4. `README.md`
**新增章节**: "📋 环境要求"
- 详细说明 Node.js 14.x 的安装方法
- 提供 Windows、macOS、Linux 的安装指导
- 说明自动版本检查机制

## 🚀 使用方法

### 快速设置（Windows）
```powershell
# 运行 PowerShell 脚本
.\setup-node.ps1

# 或运行批处理文件
.\setup-node.bat
```

### 手动安装 Node.js 14.x

**使用 nvm (推荐)**:
```bash
# Windows (nvm-windows)
nvm install 14.21.3
nvm use 14.21.3

# macOS/Linux (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 14.21.3
nvm use 14.21.3
nvm alias default 14.21.3
```

**直接下载**: 访问 https://nodejs.org/download/release/v14.21.3/

### 版本验证
运行以下任一命令时会自动检查版本：
```bash
npm install    # 安装依赖前检查
npm run dev    # 开发模式前检查
npm run build  # 构建前检查
```

## ✅ 验证结果

版本检查脚本测试通过：
```
当前 Node.js 版本: v14.21.3
需要的 Node.js 版本: 14.x
✅ Node.js 版本检查通过！
```

## 📋 总结

通过以上配置，项目现在可以：

1. **自动检查** Node.js 版本兼容性
2. **阻止错误版本** 运行关键命令
3. **提供清晰指导** 帮助用户安装正确版本
4. **CI/CD 支持** 在 AppVeyor 中使用 Node.js 14
5. **跨平台兼容** 支持 Windows、macOS、Linux

所有的版本检查都是在项目启动前进行，确保开发者使用正确的 Node.js 版本，避免因版本不兼容导致的构建或运行问题。
