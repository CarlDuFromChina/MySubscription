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
        ref="syncStatus"
        :user="currentUser"
        @sync-success="handleSyncSuccess"
        @logout="handleLogout">
      </sync-status>
      
      <!-- 本地模式提示 -->
      <el-alert
        v-if="localMode"
        type="info"
        :closable="false"
        style="margin-bottom: 20px;">
        <div slot="title" class="local-mode-title">
          <span>本地模式</span>
        </div>
        <div>您正在使用本地模式，数据仅保存在本设备。如需多设备同步，请<span class="login-link" @click="showLogin">登录</span>账号。</div>
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
            <el-button type="info" icon="el-icon-upload2" circle @click="triggerFileInput"></el-button>
          </el-tooltip>
          <el-tooltip content="添加订阅" placement="top">
            <el-button type="primary" icon="el-icon-plus" circle @click="showAddDialog = true">
            </el-button>
          </el-tooltip>
        </div>
      </div>

      <el-table :data="subscriptions" :key="tableKey" style="width: 100%;" stripe>
        <el-table-column prop="product" label="产品" min-width="120"></el-table-column>
        <el-table-column prop="project" label="项目" min-width="120"></el-table-column>
        <el-table-column prop="expireDate" label="到期时间" min-width="120">
          <template slot-scope="scope">
            <span>{{ formatDate(scope.row.expireDate) }}</span>
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
      tableKey: 0, // 用于强制刷新 table
      
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
  async mounted() {
    // 检查是否已登录
    this.checkAuthStatus();
    
    // 根据登录状态加载数据
    if (this.isAuthenticated || this.localMode) {
      await this.loadDataByAuthStatus();
      // 启动定期检查
      NotificationService.startPeriodicCheck(this.subscriptions);
    }
    
    // 检查是否是首次使用
    this.checkFirstTimeUser();
  },
  methods: {
    // 触发文件输入
    triggerFileInput() {
      this.importDataElectron();
    },

    // 使用 Electron 原生对话框导入
    async importDataElectron() {
      try {
        this.$message.info('正在打开文件选择器...');
        const subscriptions = await StorageService.importDataElectron();
        
        if (subscriptions === null) {
          // 用户取消了文件选择
          console.log('用户取消了文件选择');
          return;
        }
        
        if (!Array.isArray(subscriptions)) {
          throw new Error('导入的数据格式不正确，应该是数组格式');
        }
        
        if (subscriptions.length === 0) {
          this.$message.warning('导入的文件中没有有效的订阅数据');
          return;
        }
        
        this.subscriptions = subscriptions;
        // 根据登录状态保存数据
        await this.saveDataByAuthStatus();
        this.$message.success(`数据导入成功！共导入 ${subscriptions.length} 条订阅记录`);
        console.log('导入成功:', subscriptions);
      } catch (error) {
        console.error('Electron 导入失败:', error);
        this.$message.error('数据导入失败：' + error.message);
      }
    },

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
    async handleAuthSuccess(user) {
      // 先清空当前数据，避免重复
      this.subscriptions = [];
      
      this.isAuthenticated = true;
      this.currentUser = user;
      this.localMode = false;
      localStorage.removeItem('local-mode-enabled');
      
      // 登录成功后从服务器加载最新数据
      await this.loadDataByAuthStatus();
      // 启动定期检查
      NotificationService.startPeriodicCheck(this.subscriptions);
    },
    
    // 跳过认证，使用本地模式
    async handleSkipAuth() {
      this.localMode = true;
      localStorage.setItem('local-mode-enabled', 'true');
      await this.loadDataByAuthStatus();
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
      
      // 清空本地缓存数据
      this.subscriptions = [];
      StorageService.clearLocalData();
      
      localStorage.setItem('local-mode-enabled', 'true');
      this.$message.info('已退出登录，本地数据已清空，切换到本地模式');
    },
    // 格式化日期
    formatDate(date) {
      if (!date) return '/';
      const d = new Date(date);
      if (isNaN(d.getTime())) return '/';
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
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
    async loadData() {
      const stored = StorageService.getSubscriptions();
      if (stored.length > 0) {
        this.subscriptions = stored;
      } else {
        // 如果没有存储数据，使用默认数据
        this.subscriptions = [];
        // 根据登录状态保存数据
        await this.saveDataByAuthStatus();
      }
    },

    // 加载远程数据
    async loadRemoteData() {
      try {
        // 显示加载提示
        const loading = this.$loading({
          lock: true,
          text: '正在同步远程数据...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });

        // 记录开始时间
        const start = Date.now();
        // 从服务器同步数据
        const result = await StorageService.syncFromServer();

        if (result.success) {
          // 更新本地数据
          this.subscriptions = result.subscriptions || [];
          console.log('远程数据同步成功，共加载', this.subscriptions.length, '条订阅记录');
        } else {
          // 同步失败，回退到本地数据
          console.warn('远程数据同步失败:', result.error);
          this.$message.warning('远程数据同步失败，使用本地数据: ' + result.error);
          this.loadData(); // 作为备选方案加载本地数据
        }

        // 计算已用时间，保证 loading 至少显示 500ms
        const elapsed = Date.now() - start;
        if (elapsed < 500) {
          await new Promise(resolve => setTimeout(resolve, 500 - elapsed));
        }
        loading.close();
      } catch (error) {
        // 网络错误或其他异常，回退到本地数据
        console.error('远程数据加载出错:', error);
        this.$message.warning('无法连接到服务器，使用本地数据');
        this.loadData(); // 作为备选方案加载本地数据
      }
    },

    // 保存数据（兼容性方法，内部调用统一方法）
    async saveData() {
      await this.saveDataByAuthStatus();
    },

    // 导出数据
    async exportData() {
      if (this.isAuthenticated) {
        // 已登录用户：导出最新的远程数据
        try {
          // 先从服务器获取最新数据
          const result = await StorageService.syncFromServer();
          if (result.success) {
            // 使用服务器数据导出
            this.subscriptions = result.subscriptions || [];
            StorageService.exportData();
            this.$message.success('已导出最新的服务器数据');
          } else {
            // 服务器同步失败，使用本地数据导出
            StorageService.exportData();
            this.$message.warning('无法获取服务器数据，已导出本地数据: ' + result.error);
          }
        } catch (error) {
          // 网络错误，使用本地数据导出
          StorageService.exportData();
          this.$message.warning('无法连接服务器，已导出本地数据');
        }
      } else {
        // 本地模式：直接导出本地数据
        StorageService.exportData();
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
    saveSubscription() {
      this.$refs.subscriptionForm.validate(async (valid) => {
        if (valid) {
          if (this.editingIndex !== -1) {
            this.subscriptions[this.editingIndex] = { ...this.currentSubscription };
            this.$message.success('订阅已更新');
          } else {
            this.subscriptions.push({ ...this.currentSubscription });
            this.$message.success('订阅已添加');
          }
          // 根据登录状态保存数据
          await this.saveDataByAuthStatus();
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
      }).then(async () => {
        this.subscriptions.splice(index, 1);
        // 根据登录状态保存数据
        await this.saveDataByAuthStatus();
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

    // 统一的数据加载方法（根据登录状态选择数据源）
    async loadDataByAuthStatus() {
      if (this.isAuthenticated) {
        // 已登录：从远程加载数据
        await this.loadRemoteData();
      } else {
        // 本地模式：从本地加载数据
        this.loadData();
      }
    },

    // 统一的数据保存方法（根据登录状态选择保存方式）
    async saveDataByAuthStatus() {
      if (this.isAuthenticated) {
        // 已登录：保存到远程服务器（会自动同步到本地）
        try {
          const result = await StorageService.syncToServer();
          if (result.success) {
            // 同步成功后更新本地缓存
            StorageService.saveSubscriptions(this.subscriptions);
            console.log('数据已同步到服务器');
          } else {
            // 同步失败，保存到本地作为备份
            StorageService.saveSubscriptions(this.subscriptions);
            this.$message.warning('同步服务器失败，已保存到本地: ' + result.error);
          }
        } catch (error) {
          // 网络错误，保存到本地作为备份
          StorageService.saveSubscriptions(this.subscriptions);
          this.$message.warning('无法连接服务器，已保存到本地');
        }
      } else {
        // 本地模式：只保存到本地
        StorageService.saveSubscriptions(this.subscriptions);
      }
      // 强制刷新 Table，确保界面立即更新
      this.$nextTick(() => {
        // 触发数组的响应式更新
        this.subscriptions = [...this.subscriptions];
        // 强制重新渲染表格
        this.tableKey += 1;
      });
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

/* 本地模式提示样式 */
.local-mode-title span {
  font-weight: 600;
  font-size: 14px;
}

.login-link {
  color: #409EFF;
  cursor: pointer;
  text-decoration: none;
  font-weight: 500 !important;
  transition: color 0.3s;
}

.login-link:hover {
  color: #66b1ff;
  text-decoration: underline;
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
