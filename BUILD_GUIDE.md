# 构建指南

## 问题解决

### macOS 签名问题

在 macOS 上构建时，即使你有有效的 Apple Developer 证书，也可能会遇到代码签名验证问题。

#### 问题原因

1. **证书类型问题**：
   - `Apple Development` 证书：仅用于开发和测试，无法通过 Gatekeeper 验证
   - `Developer ID Application` 证书：用于分发，需要公证后才能通过验证

2. **公证要求**：
   - macOS 要求所有分发的应用都必须经过公证（notarization）
   - electron-builder 的 `spctl --assess` 验证步骤会检查这一点

3. **当前检测到的证书**：

   ```text
   Apple Development: 894944026@qq.com (998P27XJX3)
   ```

   这是开发证书，适用于本地开发，但不适用于分发。

#### 解决方案

##### 方案 1：开发环境构建（推荐）

我们在 `package.json` 中的 `build.mac` 配置中添加了以下设置：

```json
"mac": {
  "icon": "build/icons/icon.icns",
  "identity": null,
  "gatekeeperAssess": false,
  "target": "zip"
}
```

- `identity: null` - 跳过代码签名
- `gatekeeperAssess: false` - 跳过 Gatekeeper 评估
- `target: "zip"` - 只生成 ZIP 文件，避免 DMG 构建问题

##### 方案 2：获取分发证书（用于生产环境）

如果需要分发应用，你需要：

1. 申请 `Developer ID Application` 证书
2. 配置公证流程
3. 使用以下配置：

```json
"mac": {
  "icon": "build/icons/icon.icns",
  "identity": "Developer ID Application: Your Name (XXXXXXXXXX)",
  "hardenedRuntime": true,
  "entitlements": "build/entitlements.plist",
  "entitlementsInherit": "build/entitlements.plist",
  "gatekeeperAssess": false
},
"afterSign": "scripts/notarize.js"
```

## 构建命令

### 推荐的构建命令

#### 默认构建（ZIP 包）

```bash
npm run build
```

生成 ZIP 分发包，适合大多数情况。

#### 生成 DMG 文件

```bash
npm run build:dmg
```

生成 macOS DMG 安装文件，包含应用图标和拖拽安装界面。

#### 生成所有格式

```bash
npm run build:all
```

同时生成 ZIP 和 DMG 两种格式。

#### 仅构建应用目录

```bash
npm run build:dir
```

只构建应用程序，不打包成分发文件。用于测试或手动处理。

### 具体用途

- **ZIP 格式**：文件小，下载快，适合网络分发
- **DMG 格式**：macOS 标准格式，用户体验更好，适合正式发布

## 构建输出

构建完成后，你会在 `build/` 目录中找到：

- `订阅簿.app` - macOS 应用程序
- `订阅簿-0.0.1-mac.zip` - ZIP 分发包
- `latest-mac.yml` - 更新信息文件

## 故障排除

### DMG 构建失败

如果遇到 `Mac::Finder::DSStore.pm` 相关错误，说明系统缺少必要的 Perl 模块。解决方案：

1. 使用 ZIP 目标代替 DMG（已在配置中设置）
2. 或者安装缺失的 Perl 模块：

   ```bash
   cpan Mac::Finder::DSStore
   ```

### 签名验证失败

如果遇到 `spctl --assess` 失败，说明代码签名有问题。解决方案：

1. 使用无签名构建（已配置）
2. 或者配置正确的开发者证书

## 运行构建好的应用

```bash
open build/mac/订阅簿.app
```

## 注意事项

- 开发环境中建议使用无签名构建
- 生产环境发布时需要配置正确的代码签名
- 如需分发给其他用户，建议对应用进行公证（notarization）
