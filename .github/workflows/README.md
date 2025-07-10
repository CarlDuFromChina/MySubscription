# GitHub Actions 配置总结

本文档总结了 GitHub Actions workflows 的配置，确保使用 Node.js 14 并优化构建流程。

## 📁 Workflow 文件概览

### 1. `electron-build.yml` - Electron 应用构建和发布
- **触发条件**: 只在创建 `app-v*` 标签时触发（如 `app-v1.0.0`）
- **Node.js 版本**: 14
- **功能**: 
  - 代码质量检查
  - 跨平台构建（Windows、macOS、Linux）
  - 自动创建 GitHub Release
  - 上传构建产物

### 2. `docker-backend.yml` - Docker 镜像构建和推送
- **触发条件**: 只在创建 `v*` 标签时触发（如 `v1.0.0`）
- **Node.js 版本**: 14
- **功能**:
  - 后端代码测试和质量检查
  - 多架构 Docker 镜像构建（AMD64、ARM64）
  - 推送到 GitHub Container Registry (ghcr.io)
  - 安全漏洞扫描

**生成的镜像标签：**

- `ghcr.io/owner/repo/subscription-manager-api:v1.0.0` (版本标签)
- `ghcr.io/owner/repo/subscription-manager-api:latest` (最新版本别名)

## 工作流程详细说明

### 1. Docker 后端构建 (`docker-backend.yml`)

用于构建和发布后端 API 服务的 Docker 镜像。

**触发条件：**
- 创建 `v*` 标签（如 `v1.0.0`）

**主要功能：**

- 后端代码测试和质量检查
- 多架构 Docker 镜像构建（AMD64、ARM64）
- 推送到 GitHub Container Registry (ghcr.io)
- 安全漏洞扫描

### 2. Electron 应用构建 (`electron-build.yml`)

用于构建跨平台的桌面应用程序。

**触发条件：**

- 创建 `app-v*` 标签（如 `app-v1.0.0`）

**主要功能：**

- 前端代码质量检查
- 跨平台构建 Electron 应用（Windows、macOS、Linux）
- 自动创建 GitHub Release（当推送标签时）

## 使用指南

### 发布后端服务

**创建后端版本：**

```bash
git tag v1.0.0
git push origin v1.0.0
```

### 发布 Electron 应用

**创建应用版本：**

```bash
git tag app-v1.0.0
git push origin app-v1.0.0
```

## Docker 镜像使用

### 拉取镜像

```bash
# 最新版本
docker pull ghcr.io/owner/repo/subscription-manager-api:latest

# 特定版本
docker pull ghcr.io/owner/repo/subscription-manager-api:v1.0.0
```

### 运行容器

```bash
# 基本运行
docker run -p 3000:3000 ghcr.io/owner/repo/subscription-manager-api:latest

# 使用环境变量
docker run -p 3000:3000 \
  -e DB_HOST=localhost \
  -e DB_USER=user \
  -e DB_PASSWORD=password \
  -e DB_NAME=subscription_manager \
  -e JWT_SECRET=your-secret \
  ghcr.io/owner/repo/subscription-manager-api:latest
```

### 使用 Docker Compose

项目提供了现成的 Docker Compose 配置：

```bash
# 开发环境
npm run docker:backend:dev

# 生产环境
npm run docker:backend:prod

# 或直接使用 Docker Compose
cd backend
docker-compose up -d
```

## 配置要求

### GitHub 权限设置

确保 GitHub Actions 有权限推送到 Container Registry：

1. 前往仓库 **Settings > Actions > General**
2. 在 "Workflow permissions" 部分选择 **"Read and write permissions"**
3. 勾选 **"Allow GitHub Actions to create and approve pull requests"**

## 监控和调试

### 查看状态

- **工作流运行状态**：仓库的 "Actions" 标签页
- **构建的镜像**：仓库的 "Packages" 标签页
- **发布的应用**：仓库的 "Releases" 标签页

### 故障排除

**常见问题：**

1. **权限错误** - 确保 GITHUB_TOKEN 有足够权限
2. **构建失败** - 检查 backend 目录下的 Dockerfile 和 package.json
3. **测试失败** - 确保所有测试在本地都能通过
4. **镜像推送失败** - 检查容器注册中心权限设置

**调试方法：**

1. 查看 Actions 详细日志
2. 本地运行相同的 Docker 构建命令
3. 检查环境变量和依赖项配置

## 本地测试

在推送代码前，建议先在本地测试：

```bash
# 后端测试
cd backend
npm test
npm run lint

# Docker 构建测试
npm run docker:build

# 项目状态检查
cd ..
npm run status
```
