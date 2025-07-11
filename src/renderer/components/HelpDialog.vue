<template>
  <el-dialog 
    title="使用说明" 
    :visible.sync="visible" 
    width="550px"
    top="5vh"
    @close="$emit('close')">
    
    <div class="help-content">
      <!-- 快速上手 -->
      <div class="quick-start">
        <h4><i class="el-icon-lightning"></i> 快速上手</h4>
        <div class="steps-container">
          <div class="step-item" v-for="(step, index) in quickSteps" :key="index" :class="{ active: index === 0 }">
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-content">
              <div class="step-title">{{ step.title }}</div>
              <div class="step-desc">{{ step.desc }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 功能亮点 -->
      <div class="feature-highlights">
        <h4><i class="el-icon-star-on"></i> 功能亮点</h4>
        <div class="features-grid">
          <div class="feature-item" v-for="feature in features" :key="feature.name">
            <i :class="feature.icon"></i>
            <span>{{ feature.name }}</span>
          </div>
        </div>
      </div>
      
      <!-- 操作提示 -->
      <div class="tips-section">
        <h4><i class="el-icon-info"></i> 操作提示</h4>
        <div class="tips-list">
          <div class="tip-item" v-for="tip in tips" :key="tip">
            <i class="el-icon-check"></i>
            <span>{{ tip }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div slot="footer" class="dialog-footer">
      <el-button @click="$emit('close')">我知道了</el-button>
      <el-button type="primary" @click="$emit('close')">开始使用</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'HelpDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    isAuthenticated: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      quickSteps: [
        {
          title: '选择使用模式',
          desc: '本地模式或云同步模式，随时可切换'
        },
        {
          title: '添加订阅',
          desc: '点击右上角 + 按钮，填写订阅信息'
        },
        {
          title: '管理数据',
          desc: '编辑、删除订阅，导入导出数据'
        }
      ],
      features: [
        { name: '费用统计', icon: 'el-icon-data-line' },
        { name: '到期提醒', icon: 'el-icon-bell' },
        { name: '数据导出', icon: 'el-icon-download' },
        { name: '云端同步', icon: 'el-icon-refresh' },
        { name: '智能筛选', icon: 'el-icon-search' },
        { name: '多币种支持', icon: 'el-icon-money' }
      ],
      tips: [
        '支持按状态和续费模式筛选订阅',
        '即将到期的订阅会有醒目提示',
        '可导出 JSON 格式备份数据',
        '登录后数据自动云端同步'
      ]
    }
  }
}
</script>

<style scoped>
/* 减少对话框内容区域的内边距 - 使用深度选择器 */
::v-deep .el-dialog__body {
  padding: 15px 20px !important;
}

.help-content {
  padding: 0;
}

/* 快速上手 */
.quick-start {
  margin-bottom: 24px;
}

.quick-start h4,
.feature-highlights h4,
.tips-section h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.quick-start h4 i {
  color: #e6a23c;
}

.feature-highlights h4 i {
  color: #f56c6c;
}

.tips-section h4 i {
  color: #409eff;
}

.steps-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.step-item {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 3px solid #e4e7ed;
  transition: all 0.3s;
}

.step-item.active {
  border-left-color: #409eff;
  background: #ecf5ff;
}

.step-number {
  width: 24px;
  height: 24px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  margin-right: 12px;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
  font-size: 14px;
}

.step-desc {
  color: #606266;
  font-size: 13px;
  line-height: 1.4;
}

/* 功能亮点 */
.feature-highlights {
  margin-bottom: 24px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  color: #606266;
  font-size: 13px;
  transition: all 0.3s;
}

.feature-item:hover {
  background: #ecf5ff;
  color: #409eff;
}

.feature-item i {
  margin-right: 8px;
  color: #409eff;
  font-size: 14px;
}

/* 操作提示 */
.tips-section {
  margin-bottom: 8px;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  color: #606266;
  font-size: 13px;
  line-height: 1.5;
}

.tip-item i {
  margin-right: 8px;
  color: #67c23a;
  font-size: 12px;
  margin-top: 2px;
  flex-shrink: 0;
}

.dialog-footer {
  text-align: right;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
  margin-top: 16px;
}
</style>
