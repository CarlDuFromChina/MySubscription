const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());

// 数据库连接
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'subscription_manager',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 认证中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: '访问被拒绝' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: '无效的令牌' });
    }
    req.user = user;
    next();
  });
};

// 用户注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // 检查用户是否已存在
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: '用户已存在' });
    }

    // 密码加密
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 创建用户
    const result = await pool.query(
      'INSERT INTO users (email, password, username, created_at) VALUES ($1, $2, $3, $4) RETURNING id, email, username',
      [email, hashedPassword, username, new Date()]
    );

    const user = result.rows[0];

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: '注册成功',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        token: token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 用户登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 查找用户
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: '用户不存在' });
    }

    const user = result.rows[0];

    // 验证密码
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: '密码错误' });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: '登录成功',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        token: token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 上传同步数据
app.post('/api/sync/upload', authenticateToken, async (req, res) => {
  try {
    const { subscriptions } = req.body;
    const userId = req.user.userId;

    // 删除用户现有数据
    await pool.query('DELETE FROM subscriptions WHERE user_id = $1', [userId]);

    // 插入新数据
    if (subscriptions && subscriptions.length > 0) {
      for (const subscription of subscriptions) {
        await pool.query(
          'INSERT INTO subscriptions (user_id, product, project, expire_date, cost, currency, period, renewal_mode, description, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
          [
            userId,
            subscription.product,
            subscription.project,
            subscription.expireDate || null,
            subscription.cost,
            subscription.currency,
            subscription.period,
            subscription.renewalMode,
            subscription.description || null,
            new Date()
          ]
        );
      }
    }

    // 更新用户的最后同步时间
    await pool.query('UPDATE users SET last_sync = $1 WHERE id = $2', [new Date(), userId]);

    res.json({ message: '数据同步成功' });
  } catch (error) {
    console.error('Upload sync error:', error);
    res.status(500).json({ message: '同步失败' });
  }
});

// 下载同步数据
app.get('/api/sync/download', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      'SELECT product, project, expire_date, cost, currency, period, renewal_mode, description FROM subscriptions WHERE user_id = $1',
      [userId]
    );

    const subscriptions = result.rows.map(row => ({
      product: row.product,
      project: row.project,
      expireDate: row.expire_date,
      cost: row.cost,
      currency: row.currency,
      period: row.period,
      renewalMode: row.renewal_mode,
      description: row.description
    }));

    res.json({ subscriptions });
  } catch (error) {
    console.error('Download sync error:', error);
    res.status(500).json({ message: '同步失败' });
  }
});

// 获取用户信息
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      'SELECT id, email, username, created_at, last_sync FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      createdAt: user.created_at,
      lastSync: user.last_sync
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: '获取用户信息失败' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
