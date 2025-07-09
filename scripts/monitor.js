#!/usr/bin/env node

const https = require('https');
const http = require('http');

class DeploymentMonitor {
  constructor() {
    this.endpoints = [
      {
        name: 'Backend API (Health Check)',
        url: 'http://localhost:3000/health',
        timeout: 5000
      },
      {
        name: 'Backend API (Production)',
        url: 'https://api.example.com/health',
        timeout: 10000,
        optional: true
      },
      {
        name: 'Backend API (Staging)',
        url: 'https://staging-api.example.com/health',
        timeout: 10000,
        optional: true
      }
    ];
  }

  async checkEndpoint(endpoint) {
    return new Promise((resolve) => {
      const url = new URL(endpoint.url);
      const client = url.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: 'GET',
        timeout: endpoint.timeout,
        headers: {
          'User-Agent': 'Deployment-Monitor/1.0'
        }
      };

      const startTime = Date.now();
      
      const req = client.request(options, (res) => {
        const responseTime = Date.now() - startTime;
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            name: endpoint.name,
            status: res.statusCode >= 200 && res.statusCode < 300 ? 'UP' : 'DOWN',
            statusCode: res.statusCode,
            responseTime,
            data: data.slice(0, 200), // 限制数据长度
            error: null
          });
        });
      });

      req.on('error', (error) => {
        resolve({
          name: endpoint.name,
          status: 'DOWN',
          statusCode: null,
          responseTime: Date.now() - startTime,
          data: null,
          error: error.message
        });
      });

      req.on('timeout', () => {
        req.destroy();
        resolve({
          name: endpoint.name,
          status: 'TIMEOUT',
          statusCode: null,
          responseTime: endpoint.timeout,
          data: null,
          error: 'Request timeout'
        });
      });

      req.end();
    });
  }

  async checkAll() {
    console.log('🔍 Checking deployment status...\n');
    
    const results = await Promise.all(
      this.endpoints.map(endpoint => this.checkEndpoint(endpoint))
    );

    let allUp = true;
    let criticalDown = false;

    results.forEach(result => {
      const statusIcon = {
        'UP': '✅',
        'DOWN': '❌',
        'TIMEOUT': '⏱️'
      }[result.status] || '❓';

      console.log(`${statusIcon} ${result.name}`);
      console.log(`   Status: ${result.status}`);
      if (result.statusCode) {
        console.log(`   HTTP: ${result.statusCode}`);
      }
      console.log(`   Response Time: ${result.responseTime}ms`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      if (result.data && result.status === 'UP') {
        try {
          const parsed = JSON.parse(result.data);
          if (parsed.status) {
            console.log(`   Service Status: ${parsed.status}`);
          }
          if (parsed.timestamp) {
            console.log(`   Last Update: ${parsed.timestamp}`);
          }
        } catch {
          // 忽略解析错误
        }
      }
      
      console.log('');

      if (result.status !== 'UP') {
        allUp = false;
        // 检查是否是关键服务
        const endpoint = this.endpoints.find(e => e.name === result.name);
        if (!endpoint?.optional) {
          criticalDown = true;
        }
      }
    });

    // 生成总结
    console.log('📊 Deployment Summary:');
    
    if (allUp) {
      console.log('✅ All services are running normally');
    } else if (!criticalDown) {
      console.log('⚠️  Some optional services are down, but core services are running');
    } else {
      console.log('❌ Critical services are down - deployment may have issues');
    }

    const upCount = results.filter(r => r.status === 'UP').length;
    console.log(`📈 Service Status: ${upCount}/${results.length} services up`);

    // Docker 状态检查
    await this.checkDockerStatus();

    return {
      allUp,
      criticalDown,
      results,
      summary: `${upCount}/${results.length} services up`
    };
  }

  async checkDockerStatus() {
    console.log('\n🐳 Docker Status:');
    
    try {
      const { execSync } = require('child_process');
      
      // 检查 Docker 是否运行
      try {
        execSync('docker version', { stdio: 'ignore' });
        console.log('✅ Docker is running');
      } catch {
        console.log('❌ Docker is not running or not installed');
        return;
      }

      // 检查运行中的容器
      try {
        const containers = execSync('docker ps --format "table {{.Names}}\\t{{.Status}}"', { encoding: 'utf8' });
        console.log('📦 Running containers:');
        console.log(containers);
      } catch {
        console.log('⚠️  Could not list Docker containers');
      }

    } catch (error) {
      console.log('❌ Docker status check failed:', error.message);
    }
  }

  async monitor(interval = 30000) {
    console.log(`🔄 Starting continuous monitoring (every ${interval/1000}s)...\n`);
    
    while (true) {
      await this.checkAll();
      console.log(`⏰ Next check in ${interval/1000} seconds...\n`);
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
}

// CLI 接口
if (require.main === module) {
  const monitor = new DeploymentMonitor();
  const args = process.argv.slice(2);
  
  if (args.includes('--monitor') || args.includes('-m')) {
    const interval = parseInt(args.find(arg => arg.startsWith('--interval='))?.split('=')[1]) || 30000;
    monitor.monitor(interval);
  } else if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🔍 Deployment Status Monitor

Usage:
  node scripts/monitor.js              # One-time check
  node scripts/monitor.js --monitor    # Continuous monitoring
  node scripts/monitor.js -m --interval=60000  # Monitor every 60 seconds

Options:
  --monitor, -m           Enable continuous monitoring
  --interval=<ms>         Set monitoring interval (default: 30000ms)
  --help, -h              Show this help message

Examples:
  node scripts/monitor.js                     # Quick status check
  node scripts/monitor.js --monitor           # Monitor with default interval
  node scripts/monitor.js -m --interval=10000 # Monitor every 10 seconds
`);
  } else {
    monitor.checkAll().then(result => {
      process.exit(result.criticalDown ? 1 : 0);
    }).catch(error => {
      console.error('Monitor failed:', error);
      process.exit(1);
    });
  }
}

module.exports = DeploymentMonitor;
