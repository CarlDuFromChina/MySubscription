# 📋 MySubscription

> 一个基于 Electron + Vue.js 的现代化订阅管理桌面应用，支持本地存储和云端同步

[![Build Status](https://github.com/CarlDuFromChina/MySubscription/workflows/Docker%20Build%20&%20Push/badge.svg)](https://github.com/CarlDuFromChina/MySubscription/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker Pulls](https://img.shields.io/docker/pulls/ghcr.io/carlduformchina/mysubscription/subscription-manager-api)](https://github.com/CarlDuFromChina/MySubscription/pkgs/container/subscription-manager-api)

## 📋 环境要求

### Node.js 版本要求

本项目需要使用 **Node.js 14.x** 才能正常运行和编译。

#### 安装 Node.js 14.x

**Windows 用户：**

```powershell
# 使用 nvm-windows
nvm install 14.21.3
nvm use 14.21.3

# 或者直接下载安装
# 访问：https://nodejs.org/download/release/v14.21.3/
```

**macOS/Linux 用户：**

```bash
# 使用 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 14.21.3
nvm use 14.21.3

# 设置为默认版本
nvm alias default 14.21.3
```

#### 版本验证

项目已配置自动版本检查，运行以下命令时会自动验证 Node.js 版本：

```bash
npm install  # 安装依赖前检查
npm run dev  # 开发模式前检查
npm run build # 构建前检查
```

## ✨ 功能特性

### 📱 桌面应用（Electron）

- 🖥️ **跨平台支持** - Windows、macOS、Linux
- 🎨 **现代化 UI** - 基于 Element UI 的美观界面
- 📊 **智能表格** - 原生筛选、排序、分页功能
- 🔄 **实时同步** - 本地与云端数据自动同步
- 💾 **离线模式** - 本地数据存储，无网络也能使用

### 🌐 后端 API（Node.js）

- 🚀 **RESTful API** - 完整的订阅数据 CRUD 操作
- 🔐 **JWT 认证** - 安全的用户身份验证
- 🗄️ **PostgreSQL** - 可靠的数据持久化
- 🐳 **Docker 支持** - 容器化部署，一键启动
- 🔒 **安全审计** - 自动安全扫描和依赖检查

### 🛠️ DevOps & 自动化

- ⚡ **GitHub Actions** - CI/CD 自动化构建和发布
- 🐳 **多架构 Docker** - 支持 AMD64 和 ARM64
- 📦 **自动发布** - 桌面应用和 Docker 镜像自动构建
- 🔍 **代码质量** - 自动 Lint 检查和测试
- 📊 **监控工具** - 部署状态监控和健康检查

## 🚀 快速开始

### 桌面应用开发

```bash
# 克隆项目
git clone https://github.com/CarlDuFromChina/MySubscription.git
cd MySubscription

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 后端服务部署

#### 使用 Docker（推荐）

```bash
# 进入后端目录
cd backend

# 开发环境（包含热重载）
npm run docker:dev

# 生产环境（包含 Nginx）
npm run docker:prod

# 查看日志
npm run docker:logs
```

#### 手动部署

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，配置数据库连接等

# 启动数据库（需要 PostgreSQL）
# 运行数据库迁移
npm run db:migrate

# 启动服务
npm start
```

## 📁 项目结构

```
my-subscription/
├── 📱 前端桌面应用
│   ├── src/
│   │   ├── main/                 # Electron 主进程
│   │   ├── renderer/             # Vue.js 渲染进程
│   │   │   ├── components/       # 组件目录
│   │   │   │   ├── SubscriptionManager.vue  # 主要订阅管理界面
│   │   │   │   ├── AuthComponent.vue        # 用户认证组件
│   │   │   │   ├── SyncStatus.vue           # 同步状态显示
│   │   │   │   └── HelpDialog.vue           # 帮助对话框
│   │   │   ├── services/         # 服务层
│   │   │   │   ├── StorageService.js        # 数据存储服务
│   │   │   │   └── NotificationService.js   # 通知服务
│   │   │   └── store/            # Vuex 状态管理
│   │   └── static/               # 静态资源
│   └── build/                    # 构建输出
├── 🌐 后端 API 服务
│   ├── backend/
│   │   ├── server.js             # Express 服务器
│   │   ├── database.sql          # 数据库架构
│   │   ├── healthcheck.js        # 健康检查
│   │   ├── test/                 # 测试套件
│   │   ├── scripts/              # 工具脚本
│   │   ├── 🐳 Docker 配置
│   │   │   ├── Dockerfile        # 生产环境镜像
│   │   │   ├── Dockerfile.dev    # 开发环境镜像
│   │   │   ├── docker-compose.yml
│   │   │   └── nginx.conf        # Nginx 配置
│   │   └── 📋 文档
│   │       ├── DOCKER_GUIDE.md
│   │       └── .env.example
├── 🤖 自动化工具
│   ├── .github/workflows/        # GitHub Actions
│   │   ├── docker-backend.yml    # Docker 构建工作流
│   │   └── electron-build.yml    # 桌面应用构建
│   └── scripts/                  # 项目脚本
│       ├── release.js            # 发布管理
│       └── monitor.js            # 状态监控
└── 📚 文档
    ├── README.md                 # 项目说明
    ├── USER_GUIDE.md            # 用户使用手册
    ├── SYNC_README.md           # 同步功能说明
    ├── CHANGELOG.md             # 变更日志
    └── DOCKER_BUILD_GUIDE.md    # Docker 构建指南
```

## 💡 核心功能详解

### 🔄 数据同步机制

应用支持两种运行模式：

1. **本地模式** - 数据存储在本地，无需网络连接
2. **云同步模式** - 数据同步到云端，支持多设备访问

```javascript
// 自动同步示例
const storageService = new StorageService();

// 切换到云同步模式
await storageService.enableCloudSync(token);

// 保存数据时自动同步
await storageService.saveSubscription(subscriptionData);
```

### 🎨 用户界面特色

- **响应式设计** - 自适应不同窗口大小
- **原生筛选** - 使用 Element UI 的表格筛选功能
- **状态指示** - 实时显示同步状态和网络连接
- **深色模式** - 支持系统主题跟随

### 🔐 安全认证

- **JWT Token** - 安全的身份验证机制
- **密码加密** - 使用 bcrypt 加密存储
- **自动登录** - 记住登录状态，提升用户体验

## 🐳 Docker 部署

### 预构建镜像

我们提供多架构的 Docker 镜像：

```bash
# 拉取最新版本
docker pull ghcr.io/carlduformchina/mysubscription/subscription-manager-api:latest

# 运行容器
docker run -d \
  --name subscription-manager \
  -p 3000:3000 \
  -e DB_HOST=your-db-host \
  -e DB_USER=your-db-user \
  -e DB_PASSWORD=your-db-password \
  -e DB_NAME=subscription_manager \
  -e JWT_SECRET=your-jwt-secret \
  ghcr.io/carlduformchina/mysubscription/subscription-manager-api:latest
```

### 完整部署栈

使用 Docker Compose 一键启动完整服务：

```bash
cd backend
docker-compose up -d
```

这将启动：
- 📊 PostgreSQL 数据库
- 🌐 Node.js API 服务
- 🚀 Nginx 反向代理
- 📊 健康检查服务

## 🧪 测试与质量

### 运行测试

```bash
# 后端测试
cd backend
npm test

# 代码检查
npm run lint

# 安全审计
npm audit

# 项目状态监控
npm run status
```

### 持续集成

项目配置了 GitHub Actions，自动执行：
- ✅ 代码质量检查
- 🧪 单元测试
- 🔒 安全扫描
- 🐳 Docker 镜像构建
- 📦 自动发布

## 📋 环境变量配置

### 后端服务

复制 `backend/.env.example` 到 `backend/.env` 并配置：

```bash
# 数据库配置
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=subscription_manager
DB_PORT=5432

# JWT 配置
JWT_SECRET=your-very-secure-secret-key

# 服务配置
PORT=3000
NODE_ENV=production
```

## 🚀 发布管理

### 自动发布

使用内置的发布脚本：

```bash
# 补丁版本（bug 修复）
npm run release:patch

# 小版本（新功能）
npm run release:minor

# 大版本（重大变更）
npm run release:major

# 预览发布（不执行）
npm run release:dry
```

### 手动发布

```bash
# 后端 API
git tag v1.0.0
git push origin v1.0.0

# 桌面应用
git tag app-v1.0.0
git push origin app-v1.0.0
```

## 📊 监控与运维

### 健康检查

```bash
# 检查服务状态
curl http://localhost:3000/health

# 运行监控脚本
npm run monitor

# 持续监控
npm run monitor:watch
```

### 日志查看

```bash
# Docker 日志
npm run docker:logs

# 应用日志
tail -f logs/app.log
```

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🔗 相关链接

- [用户使用手册](USER_GUIDE.md)
- [同步功能说明](SYNC_README.md)
- [Docker 部署指南](backend/DOCKER_GUIDE.md)
- [API 文档](backend/API.md)
- [GitHub Actions 说明](.github/workflows/README.md)

## 📞 支持与反馈

- 🐛 [报告问题](https://github.com/CarlDuFromChina/MySubscription/issues)
- 💡 [功能建议](https://github.com/CarlDuFromChina/MySubscription/discussions)
- 📧 邮件：48907733+CarlDuFromChina@users.noreply.github.com

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给它一个 Star！⭐**

Made with ❤️ by [Karl Du](https://github.com/CarlDuFromChina)

</div>
