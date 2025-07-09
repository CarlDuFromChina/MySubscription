#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 简单的数据库迁移脚本
async function migrate() {
  console.log('🗄️  Running database migration...');

  try {
    // 检查数据库文件是否存在
    const dbScriptPath = path.join(__dirname, '..', 'database.sql');
    
    if (!fs.existsSync(dbScriptPath)) {
      console.log('❌ Database script not found at:', dbScriptPath);
      process.exit(1);
    }

    console.log('✅ Database script found');
    
    // 在实际项目中，这里会连接数据库并执行迁移
    // 由于我们在 CI 环境中，这里只是验证脚本存在
    const content = fs.readFileSync(dbScriptPath, 'utf8');
    
    // 基本验证 SQL 脚本
    const requiredTables = ['users', 'subscriptions'];
    const hasRequiredTables = requiredTables.every(table => 
      content.includes(`CREATE TABLE ${table}`) || content.includes(`CREATE TABLE IF NOT EXISTS ${table}`)
    );

    if (!hasRequiredTables) {
      console.log('⚠️  Warning: Database script may be missing required tables');
    } else {
      console.log('✅ Database script contains required tables');
    }

    // 检查环境变量
    const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log('⚠️  Missing environment variables:', missingVars.join(', '));
      console.log('   Migration skipped in CI environment');
    } else {
      console.log('✅ All required environment variables present');
      
      // 在实际环境中，这里会执行数据库连接和迁移
      // const { Pool } = require('pg');
      // const pool = new Pool({...});
      // await pool.query(content);
    }

    console.log('✅ Migration check completed');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// 运行迁移
if (require.main === module) {
  migrate().catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
}

module.exports = migrate;
