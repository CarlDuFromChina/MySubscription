# 订阅管理应用使用说明

## 快速开始

### 1. 选择使用模式

应用启动后，您可以选择：

- **本地模式**：点击"暂时跳过，使用本地模式"，数据仅保存在当前设备
- **云同步模式**：注册账号或登录，可在多设备间同步数据

### 2. 添加订阅

1. 点击订阅列表右上角的 ➕ 按钮
2. 填写订阅信息：
   - 产品名称（必填）
   - 项目名称（必填）
   - 到期时间（可选，不填表示永久）
   - 费用（必填）
   - 币种（CNY/USD/EUR）
   - 周期（月/年/一次性）
   - 续费模式（手动/自动续费）
   - 描述（可选）

### 3. 管理订阅

- **查看订阅**：所有订阅显示在表格中
- **筛选订阅**：点击表头的筛选图标，可按状态和续费模式筛选
- **编辑订阅**：点击表格中的"编辑"按钮
- **删除订阅**：点击表格中的"删除"按钮

### 4. 数据操作

- **导出数据**：点击 ⬇️ 按钮导出 JSON 文件
- **导入数据**：点击 ⬆️ 按钮选择 JSON 文件导入

### 5. 同步功能（需登录）

- **自动同步**：数据变更时自动同步到云端
- **手动同步**：点击同步状态卡片中的刷新按钮
- **多设备使用**：在其他设备登录相同账号即可获取数据

## 功能特点

### 📊 统计功能
- **总订阅数**：显示所有订阅的数量
- **月度支出**：计算每月的订阅费用总和
- **年度支出**：计算每年的订阅费用总和
- **即将到期**：显示30天内到期的订阅数量

### 🏷️ 状态标识
- **正常**：距离到期超过30天（绿色）
- **即将到期**：距离到期30天内（黄色）
- **已过期**：已经过期（红色）
- **永久**：无到期时间（蓝色）

### 🔄 同步状态
- **已同步**：数据已同步到云端（绿色）
- **需要同步**：超过24小时未同步（黄色）
- **同步失败**：同步过程中出现错误（红色）

## 快捷操作

### 键盘快捷键
- `Ctrl + N`：添加新订阅（计划中）
- `Ctrl + S`：手动同步（计划中）
- `F1`：显示帮助

### 鼠标操作
- 悬停在图标按钮上查看提示
- 点击状态标签查看详细信息
- 双击表格行快速编辑（计划中）

## 数据格式

### 导入/导出格式
应用使用 JSON 格式保存数据，示例：

```json
[
  {
    "product": "Netflix",
    "project": "标准套餐",
    "expireDate": "2025-12-31",
    "cost": 68,
    "currency": "CNY",
    "period": "月",
    "renewalMode": "自动续费",
    "description": "高清视频流媒体服务"
  }
]
```

### 字段说明
- `product`: 产品名称
- `project`: 项目/套餐名称
- `expireDate`: 到期日期（YYYY-MM-DD 格式，可为空）
- `cost`: 费用（数字）
- `currency`: 币种（CNY/USD/EUR）
- `period`: 周期（月/年/一次性）
- `renewalMode`: 续费模式（手动/自动续费）
- `description`: 描述信息（可选）

## 常见问题

### Q: 如何在多设备间同步数据？
A: 注册并登录账号，数据会自动同步到云端。在其他设备登录相同账号即可获取数据。

### Q: 本地模式和云同步模式有什么区别？
A: 本地模式数据仅保存在当前设备，云同步模式可在多设备间同步数据。

### Q: 可以从本地模式切换到云同步模式吗？
A: 可以，点击提示栏的"立即登录"按钮即可切换。

### Q: 数据安全吗？
A: 云同步使用加密传输，密码经过哈希处理，用户数据相互隔离。

### Q: 支持哪些币种？
A: 目前支持人民币（CNY）、美元（USD）、欧元（EUR）。

### Q: 如何计算月度/年度支出？
A: 系统会根据订阅周期自动换算，月付订阅计入月度支出，年付订阅平摊到每月。

## 技术支持

如遇到问题，请：
1. 查看控制台错误信息
2. 尝试刷新页面
3. 检查网络连接（云同步功能）
4. 联系开发者

## 更新日志

### v1.0.0
- 基础订阅管理功能
- 统计和筛选功能
- 数据导入导出
- 用户认证和云同步
- 本地模式支持
