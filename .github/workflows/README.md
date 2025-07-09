# GitHub Actions 工作流

本项目包含两个主要的 GitHub Actions 工作流，用于自动化构建和发布。

## 工作流说明

### 1. 后端 Docker 构建 (`docker-backend.yml`)

专门用于构建和推送后端 API 的 Docker 镜像。

**触发条件：**

- 推送到 `main` 或 `develop` 分支（仅当 `backend/` 目录有变更时）
- 创建 `v*` 标签
- 针对 `main` 分支的 Pull Request

**主要功能：**

- 代码质量检查（linting）
- 运行单元测试
- 构建 Docker 镜像（支持 linux/amd64 和 linux/arm64）
- 推送镜像到 GitHub Container Registry (ghcr.io)
- 安全漏洞扫描

**生成的镜像标签：**

- `ghcr.io/owner/repo/subscription-manager-api:main` (main 分支)
- `ghcr.io/owner/repo/subscription-manager-api:develop` (develop 分支)
- `ghcr.io/owner/repo/subscription-manager-api:v1.0.0` (版本标签)
- `ghcr.io/owner/repo/subscription-manager-api:latest` (main 分支的别名)

### 2. Electron 应用构建 (`electron-build.yml`)

用于构建跨平台的桌面应用程序。

**触发条件：**

- 推送到 `main` 或 `develop` 分支
- 创建 `app-v*` 标签
- 针对 `main` 分支的 Pull Request

**主要功能：**

- 前端代码质量检查
- 跨平台构建 Electron 应用（Windows、macOS、Linux）
- 自动创建 GitHub Release（当推送标签时）

## 使用指南

### 构建后端 Docker 镜像

**开发版本：**
```bash
git push origin develop
```

**生产版本：**
```bash
git push origin main
```

**标签版本：**
```bash
git tag v1.0.0
git push origin v1.0.0
```

### 构建 Electron 应用

**开发版本：**
```bash
git push origin develop  # 构建但不发布
```

**应用发布：**
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

# 开发版本
docker pull ghcr.io/owner/repo/subscription-manager-api:develop
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
