<template>
  <el-dialog 
    title="使用说明" 
    :visible.sync="visible" 
    width="600px"
    @close="$emit('close')">
    
    <div class="help-content">
      <el-steps :active="currentStep" direction="vertical">
        <el-step title="选择使用模式">
          <div slot="description">
            <p><strong>本地模式</strong>：数据仅保存在当前设备，无需注册</p>
            <p><strong>云同步模式</strong>：注册账号后可在多设备间同步数据</p>
          </div>
        </el-step>
        
        <el-step title="管理订阅">
          <div slot="description">
            <p>• 点击右上角 <el-tag size="mini" type="primary"><i class="el-icon-plus"></i></el-tag> 按钮添加订阅</p>
            <p>• 使用表格筛选功能快速查找订阅</p>
            <p>• 编辑或删除现有订阅</p>
          </div>
        </el-step>
        
        <el-step title="数据同步" v-if="showSyncStep">
          <div slot="description">
            <p>• 登录后数据会自动同步到云端</p>
            <p>• 在其他设备登录相同账号即可获取数据</p>
            <p>• 可手动点击同步按钮立即同步</p>
          </div>
        </el-step>
        
        <el-step title="开始使用">
          <div slot="description">
            <p>一切就绪！开始管理您的订阅吧 🎉</p>
          </div>
        </el-step>
      </el-steps>
      
      <div class="feature-highlights">
        <h4>功能亮点</h4>
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="feature-item">
              <i class="el-icon-data-line"></i>
              <span>费用统计</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="feature-item">
              <i class="el-icon-bell"></i>
              <span>到期提醒</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="feature-item">
              <i class="el-icon-download"></i>
              <span>数据导出</span>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="feature-item">
              <i class="el-icon-refresh"></i>
              <span>云端同步</span>
            </div>
          </el-col>
        </el-row>
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
  computed: {
    currentStep() {
      return this.isAuthenticated ? 3 : 1;
    },
    showSyncStep() {
      return this.isAuthenticated;
    }
  }
}
</script>

<style scoped>
.help-content {
  padding: 20px 0;
}

.feature-highlights {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.feature-highlights h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  color: #606266;
}

.feature-item i {
  margin-right: 8px;
  color: #409eff;
  font-size: 16px;
}

.el-steps {
  margin: 20px 0;
}

.dialog-footer {
  text-align: right;
}
</style>
