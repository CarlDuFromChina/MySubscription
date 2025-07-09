#!/usr/bin/env node

// 简单的版本检查，不依赖外部包
const packageJson = require('../package.json');
const requiredVersion = packageJson.engines.node;
const currentVersion = process.version.slice(1); // 去掉 'v' 前缀

console.log(`当前 Node.js 版本: v${currentVersion}`);
console.log(`需要的 Node.js 版本: ${requiredVersion}`);

// 检查主版本号是否为 14
const currentMajor = parseInt(currentVersion.split('.')[0]);
const requiredMajor = parseInt(requiredVersion.split('.')[0]);

if (currentMajor !== requiredMajor) {
  console.error(`❌ Node.js 版本不匹配！`);
  console.error(`当前版本: v${currentVersion}`);
  console.error(`需要版本: ${requiredVersion}`);
  console.error(`\n请安装正确的 Node.js 版本：`);
  console.error(`1. 使用 nvm: nvm install 14.21.3 && nvm use 14.21.3`);
  console.error(`2. 或者从官网下载安装: https://nodejs.org/download/release/v14.21.3/`);
  process.exit(1);
} else {
  console.log(`✅ Node.js 版本检查通过！`);
}
