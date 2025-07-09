#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ReleaseManager {
  constructor() {
    this.rootDir = process.cwd();
    this.backendDir = path.join(this.rootDir, 'backend');
    this.packagePath = path.join(this.rootDir, 'package.json');
    this.backendPackagePath = path.join(this.backendDir, 'package.json');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '🔷',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[type];
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  execCommand(command, options = {}) {
    this.log(`Executing: ${command}`);
    try {
      const result = execSync(command, { 
        encoding: 'utf8', 
        stdio: 'inherit',
        ...options 
      });
      return result;
    } catch (error) {
      this.log(`Command failed: ${error.message}`, 'error');
      throw error;
    }
  }

  getVersion(packagePath) {
    if (!fs.existsSync(packagePath)) {
      throw new Error(`Package.json not found: ${packagePath}`);
    }
    
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return pkg.version;
  }

  updateVersion(packagePath, newVersion) {
    const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    pkg.version = newVersion;
    fs.writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');
    this.log(`Updated version to ${newVersion} in ${packagePath}`, 'success');
  }

  validateGitState() {
    try {
      // 检查是否有未提交的更改
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      if (status.trim()) {
        throw new Error('Working directory is not clean. Please commit or stash changes.');
      }

      // 检查是否在正确的分支
      const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      if (!['main', 'master', 'develop'].includes(branch)) {
        this.log(`Warning: Currently on branch '${branch}'. Consider releasing from main/master/develop.`, 'warning');
      }

      this.log('Git state validation passed', 'success');
    } catch (error) {
      this.log(`Git validation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  runTests() {
    this.log('Running tests...');
    
    try {
      // 运行前端测试（如果存在）
      if (fs.existsSync(this.packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(this.packagePath, 'utf8'));
        if (pkg.scripts && pkg.scripts.test) {
          this.execCommand('npm test', { cwd: this.rootDir });
        }
      }

      // 运行后端测试
      if (fs.existsSync(this.backendPackagePath)) {
        this.execCommand('npm test', { cwd: this.backendDir });
      }

      this.log('All tests passed', 'success');
    } catch (error) {
      this.log('Tests failed', 'error');
      throw error;
    }
  }

  buildDocker() {
    this.log('Building Docker image...');
    
    try {
      this.execCommand('npm run docker:build', { cwd: this.backendDir });
      this.log('Docker image built successfully', 'success');
    } catch (error) {
      this.log('Docker build failed', 'error');
      throw error;
    }
  }

  createRelease(version, type = 'patch') {
    this.log(`Creating ${type} release: ${version}`);

    try {
      // 更新版本号
      if (fs.existsSync(this.packagePath)) {
        this.updateVersion(this.packagePath, version);
      }
      if (fs.existsSync(this.backendPackagePath)) {
        this.updateVersion(this.backendPackagePath, version);
      }

      // 提交版本更新
      this.execCommand(`git add .`);
      this.execCommand(`git commit -m "chore: bump version to ${version}"`);

      // 创建标签 - 根据新的 GitHub Actions 策略
      // v* 标签触发后端 Docker 构建
      this.execCommand(`git tag -a v${version} -m "Backend API version ${version}"`);
      
      // app-v* 标签触发前端 Electron 构建  
      this.execCommand(`git tag -a app-v${version} -m "Electron App version ${version}"`);

      this.log(`Release ${version} created successfully`, 'success');
      
      return {
        version,
        tags: [`v${version}`, `app-v${version}`]
      };
    } catch (error) {
      this.log(`Release creation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  pushRelease(tags) {
    this.log('Pushing release to remote repository...');
    
    try {
      // 推送提交
      this.execCommand('git push origin HEAD');
      
      // 推送标签
      tags.forEach(tag => {
        this.execCommand(`git push origin ${tag}`);
      });

      this.log('Release pushed successfully', 'success');
    } catch (error) {
      this.log(`Push failed: ${error.message}`, 'error');
      throw error;
    }
  }

  generateChangelog(version) {
    this.log('Generating changelog...');
    
    try {
      // 获取上一个版本的标签
      let lastTag;
      try {
        lastTag = execSync('git describe --tags --abbrev=0 HEAD~1', { encoding: 'utf8' }).trim();
      } catch {
        lastTag = 'HEAD~10'; // 如果没有标签，使用最近10个提交
      }

      // 获取提交历史
      const commits = execSync(
        `git log ${lastTag}..HEAD --pretty=format:"- %s (%an)"`,
        { encoding: 'utf8' }
      );

      const changelogEntry = `
## [${version}] - ${new Date().toISOString().split('T')[0]}

### Changes
${commits || '- No changes found'}

### Technical
- Docker image: \`ghcr.io/your-org/subscription-manager:${version}\`
- Build date: ${new Date().toISOString()}
`;

      // 更新 CHANGELOG.md
      const changelogPath = path.join(this.rootDir, 'CHANGELOG.md');
      let changelog = '';
      
      if (fs.existsSync(changelogPath)) {
        changelog = fs.readFileSync(changelogPath, 'utf8');
      } else {
        changelog = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n';
      }

      // 在文件开头插入新的更改日志条目
      const lines = changelog.split('\n');
      const headerIndex = lines.findIndex(line => line.startsWith('# Changelog'));
      if (headerIndex !== -1) {
        lines.splice(headerIndex + 3, 0, changelogEntry);
      } else {
        lines.unshift('# Changelog\n', changelogEntry);
      }

      fs.writeFileSync(changelogPath, lines.join('\n'));
      this.log('Changelog updated', 'success');
      
      return changelogEntry;
    } catch (error) {
      this.log(`Changelog generation failed: ${error.message}`, 'warning');
      return null;
    }
  }

  async release(releaseType = 'patch', options = {}) {
    const { skipTests = false, skipDocker = false, dryRun = false } = options;
    
    try {
      this.log(`Starting ${releaseType} release process...`);
      
      // 验证 Git 状态
      this.validateGitState();
      
      // 获取当前版本
      const currentVersion = this.getVersion(
        fs.existsSync(this.packagePath) ? this.packagePath : this.backendPackagePath
      );
      
      // 计算新版本
      const newVersion = this.calculateNewVersion(currentVersion, releaseType);
      this.log(`Current version: ${currentVersion}`);
      this.log(`New version: ${newVersion}`);
      
      if (dryRun) {
        this.log('DRY RUN - No changes will be made', 'warning');
        return { version: newVersion, dryRun: true };
      }
      
      // 运行测试
      if (!skipTests) {
        this.runTests();
      }
      
      // 构建 Docker 镜像
      if (!skipDocker) {
        this.buildDocker();
      }
      
      // 生成更改日志
      const changelog = this.generateChangelog(newVersion);
      
      // 创建发布
      const release = this.createRelease(newVersion, releaseType);
      
      // 推送到远程仓库
      this.pushRelease(release.tags);
      
      this.log(`🎉 Release ${newVersion} completed successfully!`, 'success');
      this.log('GitHub Actions will now build and deploy the release automatically.');
      
      return {
        version: newVersion,
        tags: release.tags,
        changelog
      };
      
    } catch (error) {
      this.log(`Release failed: ${error.message}`, 'error');
      throw error;
    }
  }

  calculateNewVersion(currentVersion, releaseType) {
    const [major, minor, patch] = currentVersion.split('.').map(Number);
    
    switch (releaseType) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
      default:
        return `${major}.${minor}.${patch + 1}`;
    }
  }
}

// CLI 界面
if (require.main === module) {
  const args = process.argv.slice(2);
  const releaseType = args[0] || 'patch';
  const options = {};
  
  // 解析命令行参数
  args.forEach(arg => {
    if (arg === '--skip-tests') options.skipTests = true;
    if (arg === '--skip-docker') options.skipDocker = true;
    if (arg === '--dry-run') options.dryRun = true;
  });
  
  const manager = new ReleaseManager();
  
  if (!['major', 'minor', 'patch'].includes(releaseType)) {
    console.log('❌ Invalid release type. Use: major, minor, or patch');
    process.exit(1);
  }
  
  console.log(`
🚀 Subscription Manager Release Tool

Usage: node scripts/release.js [type] [options]

Types:
  patch   - Bug fixes and small changes (1.0.0 -> 1.0.1)
  minor   - New features (1.0.0 -> 1.1.0)
  major   - Breaking changes (1.0.0 -> 2.0.0)

Options:
  --skip-tests    Skip running tests
  --skip-docker   Skip Docker build
  --dry-run       Show what would be done without making changes

Tags Created:
  v{version}      - Triggers backend Docker build (GitHub Actions)
  app-v{version}  - Triggers frontend Electron build (GitHub Actions)

Examples:
  node scripts/release.js patch
  node scripts/release.js minor --skip-docker
  node scripts/release.js major --dry-run

Note: This tool requires Node.js 14.x as specified in package.json
`);

  manager.release(releaseType, options)
    .then(result => {
      if (result.dryRun) {
        console.log('\n📋 Dry run completed. No changes were made.');
      } else {
        console.log(`\n🎉 Release ${result.version} completed!`);
        console.log('📦 Docker images will be built automatically by GitHub Actions.');
        console.log('🚀 Check the Actions tab for deployment progress.');
      }
    })
    .catch(error => {
      console.error('\n💥 Release failed:', error.message);
      process.exit(1);
    });
}

module.exports = ReleaseManager;
