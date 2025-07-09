#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class BasicLinter {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  log(type, file, line, message) {
    const entry = { file, line, message };
    if (type === 'error') {
      this.errors.push(entry);
    } else {
      this.warnings.push(entry);
    }
  }

  checkFile(filePath) {
    if (!fs.existsSync(filePath)) {
      this.log('error', filePath, 0, 'File does not exist');
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNumber = index + 1;

      // 检查常见问题
      if (line.includes('console.log') && !filePath.includes('test')) {
        this.log('warning', filePath, lineNumber, 'Avoid console.log in production code');
      }

      if (line.includes('TODO') || line.includes('FIXME')) {
        this.log('warning', filePath, lineNumber, 'Contains TODO/FIXME comment');
      }

      if (line.length > 120) {
        this.log('warning', filePath, lineNumber, 'Line too long (>120 characters)');
      }

      if (line.includes('eval(')) {
        this.log('error', filePath, lineNumber, 'Use of eval() is dangerous');
      }

      if (line.includes('var ') && !line.includes('//')) {
        this.log('warning', filePath, lineNumber, 'Consider using let/const instead of var');
      }

      // 检查常见的安全问题
      if (line.includes('innerHTML') && !line.includes('//')) {
        this.log('warning', filePath, lineNumber, 'innerHTML usage may be unsafe');
      }

      // 检查未使用的 require
      if (line.match(/^const\s+\w+\s*=\s*require\(/) && !content.includes(line.match(/^const\s+(\w+)/)[1] + '.')) {
        // 简单检查，可能有误报
        // this.log('warning', filePath, lineNumber, 'Potentially unused require');
      }
    });

    // 检查文件结构
    if (filePath.endsWith('.js')) {
      if (!content.includes('use strict') && !content.includes('module.exports') && !content.includes('exports.')) {
        // this.log('warning', filePath, 0, 'Consider using strict mode or module exports');
      }
    }
  }

  scanDirectory(dir, extensions = ['.js']) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        this.scanDirectory(filePath, extensions);
      } else if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
        this.checkFile(filePath);
      }
    });
  }

  report() {
    console.log('🔍 Linting Results:\n');

    if (this.errors.length > 0) {
      console.log('❌ Errors:');
      this.errors.forEach(error => {
        console.log(`   ${error.file}:${error.line} - ${error.message}`);
      });
      console.log('');
    }

    if (this.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      this.warnings.forEach(warning => {
        console.log(`   ${warning.file}:${warning.line} - ${warning.message}`);
      });
      console.log('');
    }

    console.log('📊 Summary:');
    console.log(`   Errors: ${this.errors.length}`);
    console.log(`   Warnings: ${this.warnings.length}`);

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n✨ No issues found!');
    } else if (this.errors.length === 0) {
      console.log('\n✅ No errors found (warnings can be ignored)');
    }

    return this.errors.length === 0;
  }
}

// 运行 linter
if (require.main === module) {
  const linter = new BasicLinter();
  
  // 扫描主要文件
  const filesToCheck = [
    'server.js',
    'healthcheck.js'
  ];

  // 检查指定文件
  filesToCheck.forEach(file => {
    if (fs.existsSync(file)) {
      linter.checkFile(file);
    }
  });

  // 扫描目录（如果存在）
  const dirsToScan = ['routes', 'middleware', 'models', 'utils'];
  dirsToScan.forEach(dir => {
    if (fs.existsSync(dir)) {
      linter.scanDirectory(dir);
    }
  });

  const success = linter.report();
  process.exit(success ? 0 : 1);
}

module.exports = BasicLinter;
