<template>
  <div>
    <!-- 认证界面 -->
    <auth-component 
      v-if="!isAuthenticated && !localMode" 
      @auth-success="handleAuthSuccess"
      @skip-auth="handleSkipAuth">
    </auth-component>
    
    <!-- 主应用界面 -->
    <div class="subscription-manager" v-else>
      <!-- 同步状态卡片 (仅在已认证时显示) -->
      <sync-status 
        v-if="isAuthenticated && currentUser"
        :user="currentUser"
        @sync-success="handleSyncSuccess"
        @logout="handleLogout">
      </sync-status>
      
      <!-- 本地模式提示 -->
      <el-alert
        v-if="localMode"
        title="本地模式"
        description="您正在使用本地模式，数据仅保存在本设备。如需多设备同步，请登录账号。"
        type="info"
        :closable="false"
        style="margin-bottom: 20px;">
        <el-button 
          slot="title" 
          type="text" 
          @click="showLogin"
          style="float: right; margin-top: -2px;">
          立即登录
        </el-button>
      </el-alert>
      
      <!-- 统计卡片 -->
      <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <i class="el-icon-notebook-1"></i>
            </div>
            <div class="stat-info">
              <div class="stat-title">总订阅数</div>
              <div class="stat-value">{{ subscriptions.length }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon monthly">
              <i class="el-icon-calendar"></i>
            </div>
            <div class="stat-info">
              <div class="stat-title">月度支出</div>
              <div class="stat-value">¥{{ monthlyExpense.toFixed(2) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon yearly">
              <i class="el-icon-money"></i>
            </div>
            <div class="stat-info">
              <div class="stat-title">年度支出</div>
              <div class="stat-value">¥{{ yearlyExpense.toFixed(2) }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon warning">
              <i class="el-icon-warning"></i>
            </div>
            <div class="stat-info">
              <div class="stat-title">即将到期</div>
              <div class="stat-value">{{ expiringSoon.length }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 订阅列表 -->
    <el-card class="table-card">
      <div slot="header" class="table-header">
        <span>订阅列表</span>
        <div class="table-header-right">
          <el-tooltip content="帮助" placement="top">
            <el-button type="info" icon="el-icon-question" circle @click="showHelp = true">
            </el-button>
          </el-tooltip>
          <el-tooltip content="导出数据" placement="top">
            <el-button type="success" icon="el-icon-download" circle @click="exportData"></el-button>
          </el-tooltip>
          <el-tooltip content="导入数据" placement="top">
            <el-button type="info" icon="el-icon-upload2" circle @click="$refs.fileInput.click()"></el-button>
            <input type="file" ref="fileInput" @change="importData" accept=".json" style="display: none;">
          </el-tooltip>
          <el-tooltip content="添加订阅" placement="top">
            <el-button type="primary" icon="el-icon-plus" circle @click="showAddDialog = true">
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <el-table :data="subscriptions" style="width: 100%;" stripe>
        <el-table-column prop="product" label="产品" min-width="120"></el-table-column>
        <el-table-column prop="project" label="项目" min-width="120"></el-table-column>
        <el-table-column prop="expireDate" label="到期时间" min-width="120">
          <template slot-scope="scope">
            <span>{{ scope.row.expireDate || '/' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="cost" label="费用" min-width="80"></el-table-column>
        <el-table-column prop="currency" label="币种" min-width="60"></el-table-column>
        <el-table-column prop="period" label="周期" min-width="80"></el-table-column>
        <el-table-column 
          prop="renewalMode" 
          label="续费模式" 
          min-width="100"
          :filters="[
            { text: '手动', value: '手动' },
            { text: '自动续费', value: '自动续费' }
          ]"
          :filter-method="filterRenewalMode"
          filter-placement="bottom-end">
          <template slot-scope="scope">
            <el-tag :type="scope.row.renewalMode === '自动续费' ? 'success' : 'warning'" size="small">
              {{ scope.row.renewalMode }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column 
          label="状态" 
          min-width="100"
          :filters="[
            { text: '正常', value: 'active' },
            { text: '即将到期', value: 'expiring' },
            { text: '已过期', value: 'expired' },
            { text: '永久', value: 'permanent' }
          ]"
          :filter-method="filterStatus"
          filter-placement="bottom-end">
          <template slot-scope="scope">
            <el-tag :type="getStatusTagType(scope.row.expireDate)" size="small">
              {{ getStatus(scope.row.expireDate) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="180">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="editSubscription(scope.$index)">
              编辑
            </el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteSubscription(scope.$index)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog :title="editingIndex !== -1 ? '编辑订阅' : '添加订阅'" :visible.sync="dialogVisible" width="500px" @close="closeDialog">
      <el-form :model="currentSubscription" :rules="rules" ref="subscriptionForm" label-width="80px">
        <el-form-item label="产品" prop="product">
          <el-input v-model="currentSubscription.product" placeholder="请输入产品名称"></el-input>
        </el-form-item>
        
        <el-form-item label="项目" prop="project">
          <el-input v-model="currentSubscription.project" placeholder="请输入项目名称"></el-input>
        </el-form-item>
        
        <el-form-item label="到期时间" prop="expireDate">
          <el-date-picker
            v-model="currentSubscription.expireDate"
            type="date"
            placeholder="选择到期时间"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            style="width: 100%;">
          </el-date-picker>
        </el-form-item>
        
        <el-form-item label="费用" prop="cost">
          <el-input-number v-model="currentSubscription.cost" :min="0" :precision="2" style="width: 100%;"></el-input-number>
        </el-form-item>
        
        <el-form-item label="币种" prop="currency">
          <el-select v-model="currentSubscription.currency" placeholder="请选择币种" style="width: 100%;">
            <el-option label="CNY" value="CNY"></el-option>
            <el-option label="USD" value="USD"></el-option>
            <el-option label="EUR" value="EUR"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="周期" prop="period">
          <el-select v-model="currentSubscription.period" placeholder="请选择周期" style="width: 100%;">
            <el-option label="月" value="月"></el-option>
            <el-option label="年" value="年"></el-option>
            <el-option label="一次性" value="一次性"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="续费模式" prop="renewalMode">
          <el-radio-group v-model="currentSubscription.renewalMode">
            <el-radio label="手动">手动</el-radio>
            <el-radio label="自动续费">自动续费</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="描述">
          <el-input v-model="currentSubscription.description" type="textarea" placeholder="请输入描述"></el-input>
        </el-form-item>
      </el-form>
      
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" @click="saveSubscription">保存</el-button>
      </div>
    </el-dialog>
    
    <!-- 帮助对话框 -->
    <help-dialog 
      :visible="showHelp" 
      :is-authenticated="isAuthenticated"
      @close="showHelp = false">
    </help-dialog>
    </div>
  </div>
</template>

<script>
import StorageService from '@/services/StorageService'
import NotificationService from '@/services/NotificationService'
import AuthComponent from './AuthComponent.vue'
import SyncStatus from './SyncStatus.vue'
import HelpDialog from './HelpDialog.vue'

export default {
  name: 'SubscriptionManager',
  components: {
    AuthComponent,
    SyncStatus,
    HelpDialog
  },
  data() {
    return {
      // 认证相关
      isAuthenticated: false,
      currentUser: null,
      localMode: false,
      
      // UI 相关
      showHelp: false,
      
      // 原有数据
      subscriptions: [],
      showAddDialog: false,
      editingIndex: -1,
      currentSubscription: {
        product: '',
        project: '',
        expireDate: '',
        cost: 0,
        currency: 'CNY',
        period: '年',
        renewalMode: '手动',
        description: ''
      },
      dialogVisible: false,
      rules: {
        product: [
          { required: true, message: '请输入产品名称', trigger: 'blur' }
        ],
        project: [
          { required: true, message: '请输入项目名称', trigger: 'blur' }
        ],
        cost: [
          { required: true, message: '请输入费用', trigger: 'blur' }
        ],
        currency: [
          { required: true, message: '请选择币种', trigger: 'change' }
        ],
        period: [
          { required: true, message: '请选择周期', trigger: 'change' }
        ],
        renewalMode: [
          { required: true, message: '请选择续费模式', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    monthlyExpense() {
      return this.subscriptions.reduce((total, sub) => {
        const costInRMB = this.convertToRMB(sub.cost, sub.currency);
        return total + (sub.period === '月' ? costInRMB : costInRMB / 12);
      }, 0);
    },
    yearlyExpense() {
      return this.subscriptions.reduce((total, sub) => {
        const costInRMB = this.convertToRMB(sub.cost, sub.currency);
        return total + (sub.period === '年' ? costInRMB : costInRMB * 12);
      }, 0);
    },
    expiringSoon() {
      return this.subscriptions.filter(sub => this.isExpiringSoon(sub.expireDate));
    }
  },
  watch: {
    showAddDialog(val) {
      this.dialogVisible = val;
    }
  },
  mounted() {
    // 检查是否已登录
    this.checkAuthStatus();
    
    // 如果已认证或者是本地模式，加载数据
    if (this.isAuthenticated || this.localMode) {
      this.loadData();
      // 启动定期检查
      NotificationService.startPeriodicCheck(this.subscriptions);
    }
    
    // 检查是否是首次使用
    this.checkFirstTimeUser();
  },
  methods: {
    // 检查认证状态
    checkAuthStatus() {
      const user = StorageService.getUserInfo();
      if (user && user.token) {
        this.isAuthenticated = true;
        this.currentUser = user;
        StorageService.syncEnabled = true;
      } else {
        // 检查是否之前选择了本地模式
        const localModeEnabled = localStorage.getItem('local-mode-enabled');
        if (localModeEnabled === 'true') {
          this.localMode = true;
        }
      }
    },
    
    // 检查首次使用
    checkFirstTimeUser() {
      const hasUsedBefore = localStorage.getItem('has-used-before');
      if (!hasUsedBefore && (this.isAuthenticated || this.localMode)) {
        // 延迟显示帮助，让界面先渲染完成
        setTimeout(() => {
          this.showHelp = true;
        }, 1000);
        localStorage.setItem('has-used-before', 'true');
      }
    },
    
    // 认证成功处理
    handleAuthSuccess(user) {
      this.isAuthenticated = true;
      this.currentUser = user;
      this.localMode = false;
      localStorage.removeItem('local-mode-enabled');
      this.loadData();
      // 启动定期检查
      NotificationService.startPeriodicCheck(this.subscriptions);
    },
    
    // 跳过认证，使用本地模式
    handleSkipAuth() {
      this.localMode = true;
      localStorage.setItem('local-mode-enabled', 'true');
      this.loadData();
      // 启动定期检查
      NotificationService.startPeriodicCheck(this.subscriptions);
      this.$message.info('已进入本地模式，数据仅保存在本设备');
    },
    
    // 显示登录界面
    showLogin() {
      this.localMode = false;
      this.isAuthenticated = false;
      localStorage.removeItem('local-mode-enabled');
    },
    
    // 同步成功处理
    handleSyncSuccess(subscriptions) {
      this.subscriptions = subscriptions;
    },
    
    // 登出处理
    handleLogout() {
      this.isAuthenticated = false;
      this.currentUser = null;
      this.localMode = true;
      localStorage.setItem('local-mode-enabled', 'true');
      this.$message.info('已退出登录，切换到本地模式');
    },
    // 续费模式筛选
    filterRenewalMode(value, row) {
      return row.renewalMode === value;
    },
    
    // 状态筛选
    filterStatus(value, row) {
      const status = this.getStatusValue(row.expireDate);
      return status === value;
    },
    
    // 获取状态值（用于筛选）
    getStatusValue(date) {
      if (!date) return 'permanent';
      if (this.isExpired(date)) return 'expired';
      if (this.isExpiringSoon(date)) return 'expiring';
      return 'active';
    },
    // 加载数据
    loadData() {
      const stored = StorageService.getSubscriptions();
      if (stored.length > 0) {
        this.subscriptions = stored;
      } else {
        // 如果没有存储数据，使用默认数据
        this.subscriptions = [
          {
            product: 'QQ音乐',
            project: '豪华绿钻',
            expireDate: '2025-07-04',
            cost: 100,
            currency: 'CNY',
            period: '年',
            renewalMode: '手动'
          },
          {
            product: '山姆会员',
            project: '卓越卡',
            expireDate: '2025-08-31',
            cost: 680,
            currency: 'CNY',
            period: '年',
            renewalMode: '手动'
          },
          {
            product: '网易云音乐',
            project: '黑胶会员',
            expireDate: '2025-10-01',
            cost: 0,
            currency: 'CNY',
            period: '年',
            renewalMode: '手动'
          },
          {
            product: '肯德基会员',
            project: '大神卡',
            expireDate: '2025-06-18',
            cost: 88,
            currency: 'CNY',
            period: '年',
            renewalMode: '手动'
          },
          {
            product: '泡芙云',
            project: '轻量泡芙',
            expireDate: '2025-11-08',
            cost: 91,
            currency: 'CNY',
            period: '年',
            renewalMode: '手动'
          },
          {
            product: '淘宝会员',
            project: '88vip',
            expireDate: '2025-07-21',
            cost: 88,
            currency: 'CNY',
            period: '年',
            renewalMode: '手动'
          },
          {
            product: '爱奇艺',
            project: '黄金会员',
            expireDate: '2026-04-28',
            cost: 130,
            currency: 'CNY',
            period: '年',
            renewalMode: '手动'
          },
          {
            product: '美国电话卡',
            project: '小紫卡',
            expireDate: '',
            cost: 3,
            currency: 'USD',
            period: '月',
            renewalMode: '自动续费'
          },
          {
            product: '百度网盘',
            project: 'SVIP',
            expireDate: '2025-11-27',
            cost: 176,
            currency: 'CNY',
            period: '年',
            renewalMode: '手动'
          },
          {
            product: 'ToDesk',
            project: 'Plus',
            expireDate: '2025-06-11',
            cost: 108,
            currency: 'CNY',
            period: '年',
            renewalMode: '手动'
          }
        ];
        this.saveData();
      }
    },

    // 保存数据
    saveData() {
      StorageService.saveSubscriptions(this.subscriptions);
    },

    // 导出数据
    exportData() {
      StorageService.exportData();
    },

    // 导入数据
    async importData(event) {
      const file = event.target.files[0];
      if (!file) return;

      try {
        const subscriptions = await StorageService.importData(file);
        this.subscriptions = subscriptions;
        this.$message.success('数据导入成功！');
      } catch (error) {
        this.$message.error('数据导入失败：' + error.message);
      }
    },

    convertToRMB(amount, currency) {
      const rates = {
        'CNY': 1,
        'USD': 7.2,
        'EUR': 8.0,
        // 兼容旧格式
        '人民币': 1,
        '美元': 7.2,
        '欧元': 8.0
      };
      return amount * (rates[currency] || 1);
    },
    isExpired(date) {
      if (!date) return false;
      return new Date(date) < new Date();
    },
    isExpiringSoon(date) {
      if (!date) return false;
      const expireDate = new Date(date);
      const today = new Date();
      const diffTime = expireDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30 && diffDays > 0;
    },
    getDaysLeft(date) {
      if (!date) return '永久';
      const expireDate = new Date(date);
      const today = new Date();
      const diffTime = expireDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return '已过期';
      if (diffDays === 0) return '今天到期';
      if (diffDays === 1) return '明天到期';
      return diffDays + '天后到期';
    },
    getStatus(date) {
      if (!date) return '永久';
      if (this.isExpired(date)) return '已过期';
      if (this.isExpiringSoon(date)) return '即将到期';
      return '正常';
    },
    getStatusClass(date) {
      if (!date) return 'permanent';
      if (this.isExpired(date)) return 'expired';
      if (this.isExpiringSoon(date)) return 'expiring';
      return 'active';
    },
    editSubscription(index) {
      this.editingIndex = index;
      this.currentSubscription = { ...this.subscriptions[index] };
    },
    deleteSubscription(index) {
      if (confirm('确定要删除这个订阅吗？')) {
        this.subscriptions.splice(index, 1);
        this.saveData(); // 保存到本地存储
      }
    },
    saveSubscription() {
      this.$refs.subscriptionForm.validate((valid) => {
        if (valid) {
          if (this.editingIndex !== -1) {
            this.subscriptions[this.editingIndex] = { ...this.currentSubscription };
            this.$message.success('订阅已更新');
          } else {
            this.subscriptions.push({ ...this.currentSubscription });
            this.$message.success('订阅已添加');
          }
          this.saveData(); // 保存到本地存储
          this.closeDialog();
        } else {
          this.$message.error('请填写完整信息');
        }
      });
    },
    closeDialog() {
      this.showAddDialog = false;
      this.dialogVisible = false;
      this.editingIndex = -1;
      this.currentSubscription = {
        product: '',
        project: '',
        expireDate: '',
        cost: 0,
        currency: 'CNY',
        period: '年',
        renewalMode: '手动',
        description: ''
      };
      if (this.$refs.subscriptionForm) {
        this.$refs.subscriptionForm.resetFields();
      }
    },
    
    // 编辑订阅
    editSubscription(index) {
      this.editingIndex = index;
      this.currentSubscription = { ...this.subscriptions[index] };
      this.dialogVisible = true;
    },
    
    // 删除订阅
    deleteSubscription(index) {
      this.$confirm('确定要删除这个订阅吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.subscriptions.splice(index, 1);
        this.saveData();
        this.$message.success('删除成功');
      }).catch(() => {
        this.$message.info('已取消删除');
      });
    },
    
    // 获取状态标签类型
    getStatusTagType(expireDate) {
      if (!expireDate) return 'info';
      if (this.isExpired(expireDate)) return 'danger';
      if (this.isExpiringSoon(expireDate)) return 'warning';
      return 'success';
    },
  }
}
</script>

<style scoped>
.subscription-manager {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 头部卡片 */
.header-card {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

/* 头部卡片 */
.header-card {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

/* 统计卡片 */
.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 10px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 20px;
}

.stat-icon.monthly {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
}

.stat-icon.yearly {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.stat-icon.warning {
  background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%);
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #8492a6;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

/* 表格卡片 */
.table-card {
  border-radius: 8px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 对话框 */
.dialog-footer {
  text-align: right;
}

/* 自定义标签样式 */
.el-tag {
  border-radius: 4px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .stats-row .el-col {
    margin-bottom: 15px;
  }
}
</style>
