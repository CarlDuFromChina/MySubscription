# 环境变量配置说明

## 前端环境变量

### 本地开发
在项目根目录创建 `.env.local` 文件：
```
VUE_APP_API_BASE_URL=http://localhost:3000/api
```

### 生产环境
在项目根目录创建 `.env.production` 文件：
```
VUE_APP_API_BASE_URL=https://api.yourdomain.com/api
```

## GitHub Actions 配置

在 GitHub Actions 中，API 基础地址已经在工作流程文件中硬编码为：
```
VUE_APP_API_BASE_URL=https://api.yourdomain.com/api
```

### 如果需要动态配置

1. 在 GitHub 仓库设置中添加 Repository Variables：
   - 进入仓库 Settings > Secrets and variables > Actions
   - 在 Variables 标签页中添加：
     - Name: `API_BASE_URL`
     - Value: `https://api.yourdomain.com/api`

2. 然后修改 GitHub Actions 工作流程文件使用变量：
   ```yaml
   env:
     VUE_APP_API_BASE_URL: ${{ vars.API_BASE_URL }}
   ```

## 注意事项

1. 所有以 `VUE_APP_` 开头的环境变量会被 Vue CLI 打包到最终的应用程序中
2. 环境变量文件已在 `.gitignore` 中忽略，不会被提交到仓库
3. 使用 `.env.example` 作为环境变量模板文件
4. 本地开发时使用 `.env.local`，生产构建时使用 `.env.production`
