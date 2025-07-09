# Docker 部署指南

## 快速开始

### 1. 开发环境

```bash
# 启动开发环境（包含热重载）
npm run docker:dev

# 查看日志
docker-compose -f docker-compose.dev.yml logs -f

# 停止开发环境
npm run docker:dev:down
```

### 2. 生产环境

```bash
# 复制环境变量文件
cp .env.example .env

# 修改 .env 文件中的配置
# 特别是数据库密码和 JWT 密钥

# 启动生产环境
npm run docker:up

# 查看运行状态
docker-compose ps

# 查看日志
npm run docker:logs

# 停止服务
npm run docker:down
```

### 3. 带 Nginx 的完整部署

```bash
# 启动包含 Nginx 反向代理的完整环境
npm run docker:prod

# 访问应用
# API: http://localhost/api
# 健康检查: http://localhost/health
```

## 详细配置

### 环境变量

在 `.env` 文件中配置以下变量：

```bash
# 必须修改的变量
DB_PASSWORD=your_secure_password
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# 可选修改的变量
API_PORT=3000        # API 服务端口
NGINX_PORT=80        # Nginx HTTP 端口
NGINX_SSL_PORT=443   # Nginx HTTPS 端口
```

### 数据持久化

数据库数据存储在 Docker volume 中：

```bash
# 查看 volumes
docker volume ls

# 备份数据库
docker exec subscription-db pg_dump -U postgres subscription_manager > backup.sql

# 恢复数据库
docker exec -i subscription-db psql -U postgres -d subscription_manager < backup.sql
```

### SSL/HTTPS 配置

如需启用 HTTPS：

1. 将 SSL 证书文件放在 `ssl/` 目录：
   ```
   ssl/
   ├── cert.pem
   └── key.pem
   ```

2. 取消注释 `nginx.conf` 中的 HTTPS 配置

3. 重启服务：
   ```bash
   docker-compose restart nginx
   ```

## 命令参考

### Docker Compose 命令

```bash
# 构建镜像
docker-compose build

# 启动服务（后台运行）
docker-compose up -d

# 启动指定服务
docker-compose up -d db api

# 查看服务状态
docker-compose ps

# 查看实时日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f api

# 进入容器
docker-compose exec api sh
docker-compose exec db psql -U postgres -d subscription_manager

# 重启服务
docker-compose restart api

# 停止服务
docker-compose stop

# 停止并删除容器
docker-compose down

# 停止并删除容器、网络、volumes
docker-compose down -v
```

### Docker 清理命令

```bash
# 清理未使用的镜像
docker image prune

# 清理未使用的容器
docker container prune

# 清理未使用的网络
docker network prune

# 清理未使用的 volumes
docker volume prune

# 清理所有未使用的资源
npm run docker:clean
```

## 监控和维护

### 健康检查

服务包含内置的健康检查：

```bash
# 检查 API 健康状态
curl http://localhost:3000/health

# 通过 Nginx 检查
curl http://localhost/health
```

### 日志管理

```bash
# 查看所有服务日志
docker-compose logs

# 查看最近的日志
docker-compose logs --tail=100

# 实时跟踪日志
docker-compose logs -f

# 查看特定时间的日志
docker-compose logs --since="2024-01-01T00:00:00"
```

### 性能监控

```bash
# 查看容器资源使用情况
docker stats

# 查看特定容器的资源使用
docker stats subscription-api subscription-db
```

## 故障排除

### 常见问题

1. **端口冲突**
   ```bash
   # 修改 .env 文件中的端口配置
   API_PORT=3001
   NGINX_PORT=8080
   ```

2. **数据库连接失败**
   ```bash
   # 检查数据库容器状态
   docker-compose logs db
   
   # 手动连接测试
   docker-compose exec db psql -U postgres -d subscription_manager
   ```

3. **权限问题**
   ```bash
   # 检查文件权限
   ls -la
   
   # 修改权限（Linux/Mac）
   chmod +x docker-compose.yml
   ```

4. **内存不足**
   ```bash
   # 检查 Docker 资源限制
   docker system df
   
   # 增加 Docker 内存限制
   # 在 Docker Desktop 设置中增加内存分配
   ```

### 调试技巧

```bash
# 进入容器内部调试
docker-compose exec api sh

# 查看环境变量
docker-compose exec api env

# 查看网络连接
docker-compose exec api netstat -an

# 测试数据库连接
docker-compose exec api node -e "
const { Pool } = require('pg');
const pool = new Pool({
  host: 'db',
  user: 'postgres',
  password: process.env.DB_PASSWORD,
  database: 'subscription_manager'
});
pool.query('SELECT NOW()', (err, res) => {
  console.log(err ? err : res.rows[0]);
  pool.end();
});
"
```

## 生产部署建议

### 安全配置

1. **更改默认密码**：确保修改数据库密码和 JWT 密钥
2. **使用强密码**：密码长度至少 16 字符
3. **启用防火墙**：只开放必要的端口
4. **使用 HTTPS**：在生产环境中始终使用 SSL

### 性能优化

1. **资源限制**：在 `docker-compose.yml` 中设置内存和 CPU 限制
2. **数据库优化**：调整 PostgreSQL 配置
3. **连接池**：适当配置数据库连接池大小
4. **缓存**：考虑添加 Redis 缓存

### 备份策略

```bash
# 自动备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec subscription-db pg_dump -U postgres subscription_manager > backup_$DATE.sql
```

### 更新部署

```bash
# 拉取最新代码
git pull

# 重建镜像
docker-compose build

# 滚动更新
docker-compose up -d
```
