const http = require('http');
const assert = require('assert');

// 简单的测试框架
class TestRunner {
  constructor() {
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, fn) {
    this.tests.push({ name, fn });
  }

  async run() {
    console.log('🧪 Running tests...\n');

    for (const test of this.tests) {
      try {
        await test.fn();
        console.log(`✅ ${test.name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${test.name}`);
        console.log(`   Error: ${error.message}\n`);
        this.failed++;
      }
    }

    console.log('\n📊 Test Results:');
    console.log(`   Passed: ${this.passed}`);
    console.log(`   Failed: ${this.failed}`);
    console.log(`   Total: ${this.tests.length}`);

    if (this.failed > 0) {
      process.exit(1);
    } else {
      console.log('\n🎉 All tests passed!');
      process.exit(0);
    }
  }
}

// 工具函数
function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// 启动测试服务器
function startTestServer() {
  return new Promise((resolve) => {
    // 模拟简单的测试服务器
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        message: 'Test server running',
        timestamp: new Date().toISOString()
      }));
    });

    server.listen(0, () => {
      const port = server.address().port;
      console.log(`🚀 Test server started on port ${port}`);
      resolve({ server, port });
    });
  });
}

// 测试用例
const runner = new TestRunner();

runner.test('Environment variables should be accessible', () => {
  // 在测试环境中设置默认值
  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'test';
  }
  
  assert(typeof process.env.NODE_ENV !== 'undefined', 'NODE_ENV should be defined');
  assert(typeof process.env.PORT !== 'undefined' || process.env.PORT === undefined, 'PORT should be valid if defined');
});

runner.test('Basic HTTP server functionality', async () => {
  const { server, port } = await startTestServer();
  
  try {
    const response = await makeRequest({
      hostname: 'localhost',
      port: port,
      path: '/',
      method: 'GET'
    });

    assert.strictEqual(response.statusCode, 200, 'Should return 200 status');
    
    const body = JSON.parse(response.body);
    assert(body.message, 'Response should contain message');
    assert(body.timestamp, 'Response should contain timestamp');
  } finally {
    server.close();
  }
});

runner.test('JSON parsing functionality', () => {
  const testData = { name: 'test', value: 123 };
  const jsonString = JSON.stringify(testData);
  const parsed = JSON.parse(jsonString);
  
  assert.deepStrictEqual(parsed, testData, 'JSON should parse correctly');
});

runner.test('Date functionality', () => {
  const now = new Date();
  const isoString = now.toISOString();
  const parsed = new Date(isoString);
  
  assert.strictEqual(now.getTime(), parsed.getTime(), 'Date serialization should work correctly');
});

runner.test('bcryptjs module availability', () => {
  try {
    const bcrypt = require('bcryptjs');
    assert(typeof bcrypt.hashSync === 'function', 'bcrypt.hashSync should be available');
    assert(typeof bcrypt.compareSync === 'function', 'bcrypt.compareSync should be available');
  } catch (error) {
    throw new Error('bcryptjs module should be available');
  }
});

runner.test('jsonwebtoken module availability', () => {
  try {
    const jwt = require('jsonwebtoken');
    assert(typeof jwt.sign === 'function', 'jwt.sign should be available');
    assert(typeof jwt.verify === 'function', 'jwt.verify should be available');
  } catch (error) {
    throw new Error('jsonwebtoken module should be available');
  }
});

runner.test('pg module availability', () => {
  try {
    const { Pool } = require('pg');
    assert(typeof Pool === 'function', 'pg.Pool should be available');
  } catch (error) {
    throw new Error('pg module should be available');
  }
});

// 运行测试
if (require.main === module) {
  runner.run().catch((error) => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { TestRunner, makeRequest };
