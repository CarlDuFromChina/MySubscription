# 🚀 项目部署配置指南

恭喜！你的项目已经成功连接到 GitHub 仓库：https://github.com/CarlDuFromChina/MySubscription.git

## ✅ 已完成配置

### 1. Git 仓库配置
- ✅ 已初始化本地 Git 仓库
- ✅ 已连接到远程仓库 `https://github.com/CarlDuFromChina/MySubscription.git`
- ✅ 已推送所有代码到 `main` 分支
- ✅ 已更新 README 中的所有链接

### 2. 项目结构
- ✅ 完整的 Electron + Vue.js 前端应用
- ✅ Node.js + Express + PostgreSQL 后端 API
- ✅ Docker 容器化配置
- ✅ GitHub Actions CI/CD 工作流
- ✅ 完整的测试套件和文档

## 🔧 下一步配置

### 1. GitHub 仓库设置

访问 https://github.com/CarlDuFromChina/MySubscription/settings 进行以下配置：

#### Actions 权限设置
1. 前往 **Settings > Actions > General**
2. 在 "Workflow permissions" 部分选择：
   - ☑️ **"Read and write permissions"**
   - ☑️ **"Allow GitHub Actions to create and approve pull requests"**

#### Container Registry 权限
1. 前往 **Settings > Actions > General**
2. 确保 "Fork pull request workflows" 部分：
   - ☑️ **"Run workflows from fork pull requests"**

### 2. 启用 GitHub Container Registry

你的 Docker 镜像将自动发布到：
```
ghcr.io/carlduformchina/mysubscription/subscription-manager-api:latest
```

### 3. 触发首次构建

推送任何更改到 `main` 或 `develop` 分支将自动触发 CI/CD：

```bash
# 创建开发分支
git checkout -b develop
git push -u origin develop

# 或者直接在 main 分支推送更改
echo "# 触发构建" >> README.md
git add README.md
git commit -m "ci: 触发首次 GitHub Actions 构建"
git push origin main
```

## 🐳 Docker 镜像使用

### 构建完成后，可以这样使用你的镜像：

```bash
# 拉取镜像
docker pull ghcr.io/carlduformchina/mysubscription/subscription-manager-api:latest

# 运行容器
docker run -d \
  --name mysubscription-api \
  -p 3000:3000 \
  -e DB_HOST=your-db-host \
  -e DB_USER=your-db-user \
  -e DB_PASSWORD=your-db-password \
  -e DB_NAME=subscription_manager \
  -e JWT_SECRET=your-jwt-secret \
  ghcr.io/carlduformchina/mysubscription/subscription-manager-api:latest
```

## 📱 桌面应用发布

### 创建应用发布：

```bash
# 创建应用版本标签
git tag app-v1.0.0
git push origin app-v1.0.0
```

这将自动构建 Windows、macOS 和 Linux 版本的桌面应用。

## 🔍 监控构建状态

### 查看构建进度：
1. 访问 https://github.com/CarlDuFromChina/MySubscription/actions
2. 查看工作流运行状态
3. 检查构建日志和错误信息

### 查看生成的镜像：
1. 访问 https://github.com/CarlDuFromChina/MySubscription/pkgs/container/subscription-manager-api
2. 查看发布的 Docker 镜像版本

### 查看应用发布：
1. 访问 https://github.com/CarlDuFromChina/MySubscription/releases
2. 下载构建的桌面应用

## 🛠️ 本地开发

### 前端开发：
```bash
npm install
npm run dev
```

### 后端开发：
```bash
cd backend
npm install
npm run docker:dev  # 使用 Docker
# 或
npm run dev         # 本地开发
```

## 📋 环境变量配置

### 后端服务需要的环境变量：

复制 `backend/.env.example` 到 `backend/.env`：

```bash
cd backend
cp .env.example .env
```

然后编辑 `.env` 文件配置数据库连接等信息。

## 🎯 快速验证

### 验证 GitHub Actions 是否工作：

1. 查看 Actions 页面是否有工作流运行
2. 检查是否有错误或失败的步骤
3. 确认 Docker 镜像是否成功构建和推送

### 验证应用功能：

```bash
# 运行测试
npm run test
cd backend && npm test

# 检查代码质量
npm run lint
cd backend && npm run lint

# 监控服务状态
npm run status
```

## 🚀 生产部署建议

1. **数据库**：推荐使用 PostgreSQL 云服务（如 AWS RDS、Google Cloud SQL）
2. **应用部署**：可以使用 Docker 容器部署到任何云平台
3. **域名和 SSL**：配置自定义域名和 HTTPS 证书
4. **监控**：使用项目内置的健康检查和监控工具

## 🤝 团队协作

### 分支策略：
- `main` - 生产环境代码
- `develop` - 开发环境代码  
- `feature/*` - 功能开发分支

### 发布流程：
```bash
# 使用自动发布脚本
npm run release:patch   # 修复版本
npm run release:minor   # 功能版本
npm run release:major   # 重大版本
```

---

## 📞 需要帮助？

如果在配置过程中遇到问题：

1. 检查 GitHub Actions 的构建日志
2. 确认环境变量配置正确
3. 查看项目文档：
   - [用户使用手册](USER_GUIDE.md)
   - [Docker 部署指南](backend/DOCKER_GUIDE.md)
   - [同步功能说明](SYNC_README.md)

**🎉 祝你使用愉快！项目已经全部配置完成，可以开始开发和部署了！**
