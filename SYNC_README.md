# 订阅管理同步功能

## 概述

这个同步功能允许用户将订阅数据在多个设备之间同步，通过用户账号系统实现数据的云端存储和同步。

## 功能特点

- 🔐 用户注册和登录
- 🔄 自动/手动数据同步
- 📱 多设备数据一致性
- 🔒 数据加密传输
- 📊 同步状态监控

## 技术架构

### 前端
- Vue.js + Element UI
- 本地存储 (localStorage)
- JWT 认证
- 自动同步机制

### 后端
- Node.js + Express
- PostgreSQL 数据库
- JWT 认证
- RESTful API

## 安装和部署

### 1. 后端部署

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 复制环境配置文件
cp .env.example .env

# 编辑环境变量
# 设置数据库连接、JWT密钥等
```

### 2. 数据库设置

```bash
# 安装 PostgreSQL
# Windows: 下载官方安装包
# macOS: brew install postgresql
# Linux: sudo apt-get install postgresql

# 创建数据库
psql -U postgres
CREATE DATABASE subscription_manager;

# 执行数据库脚本
psql -U postgres -d subscription_manager -f database.sql
```

### 3. 启动后端服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### 4. 前端配置

在 `StorageService.js` 中配置后端API地址：

```javascript
this.apiBaseUrl = 'http://localhost:3000/api'; // 开发环境
// this.apiBaseUrl = 'https://yourdomain.com/api'; // 生产环境
```

## 使用说明

### 1. 用户注册/登录

- 首次使用需要注册账号
- 支持邮箱和密码登录
- 自动生成JWT令牌

### 2. 数据同步

- **自动同步**: 数据变更时自动上传到服务器
- **手动同步**: 点击同步按钮手动同步
- **冲突处理**: 以服务器数据为准

### 3. 多设备使用

- 在新设备上登录相同账号
- 数据会自动从服务器同步到本地
- 任何设备上的修改都会同步到其他设备

## API 接口

### 认证相关

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/user/profile` - 获取用户信息

### 数据同步

- `POST /api/sync/upload` - 上传数据到服务器
- `GET /api/sync/download` - 从服务器下载数据

## 数据结构

### 用户表 (users)
```sql
id - 用户ID
email - 邮箱
password - 密码哈希
username - 用户名
created_at - 创建时间
last_sync - 最后同步时间
```

### 订阅表 (subscriptions)
```sql
id - 订阅ID
user_id - 用户ID
product - 产品名称
project - 项目名称
expire_date - 到期时间
cost - 费用
currency - 币种
period - 周期
renewal_mode - 续费模式
description - 描述
created_at - 创建时间
```

## 安全考虑

### 数据传输安全
- 使用HTTPS加密传输
- JWT令牌认证
- 密码bcrypt加密存储

### 数据隐私
- 用户数据隔离
- 定期清理过期令牌
- 数据库访问权限控制

## 部署建议

### 开发环境
- 使用本地PostgreSQL
- 启用CORS
- 详细错误日志

### 生产环境
- 使用云数据库 (AWS RDS, 阿里云等)
- 配置反向代理 (Nginx)
- 启用SSL证书
- 监控和日志系统

## 故障排除

### 常见问题

1. **同步失败**
   - 检查网络连接
   - 确认API地址正确
   - 验证JWT令牌是否过期

2. **登录失败**
   - 检查邮箱和密码
   - 确认后端服务是否运行
   - 查看控制台错误信息

3. **数据库连接错误**
   - 检查数据库服务是否启动
   - 验证连接配置
   - 确认数据库用户权限

### 日志查看

```bash
# 后端日志
tail -f logs/app.log

# 数据库日志
tail -f /var/log/postgresql/postgresql.log
```

## 扩展功能

### 可以添加的功能

1. **数据备份**
   - 定期自动备份
   - 手动导出备份

2. **数据恢复**
   - 从备份恢复数据
   - 版本历史记录

3. **团队协作**
   - 多用户共享订阅
   - 权限管理

4. **数据统计**
   - 同步频率统计
   - 用户活跃度分析

## 联系和支持

如果遇到问题或需要帮助，请：

1. 查看错误日志
2. 检查API文档
3. 提交Issue或联系开发者
