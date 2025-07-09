-- 创建数据库
CREATE DATABASE subscription_manager;

-- 使用数据库
\c subscription_manager;

-- 创建用户表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_sync TIMESTAMP
);

-- 创建订阅表
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product VARCHAR(255) NOT NULL,
    project VARCHAR(255) NOT NULL,
    expire_date DATE,
    cost DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    period VARCHAR(20) NOT NULL,
    renewal_mode VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_users_email ON users(email);
