<template>
  <div class="sync-status">
    <el-card class="sync-card">
      <div slot="header" class="sync-header">
        <div class="user-info">
          <el-avatar :size="40" :src="userAvatar">
            <i class="el-icon-user-solid"></i>
          </el-avatar>
          <div class="user-details">
            <div class="username">{{ user.username }}</div>
            <div class="email">{{ user.email }}</div>
          </div>
        </div>
        <div class="sync-actions">
          <el-tooltip content="手动同步" placement="top">
            <el-button 
              type="primary" 
              icon="el-icon-refresh" 
              circle 
              size="mini"
              :loading="syncing"
              @click="manualSync">
            </el-button>
          </el-tooltip>
          <el-tooltip content="登出" placement="top">
            <el-button 
              type="danger" 
              icon="el-icon-switch-button" 
              circle 
              size="mini"
              @click="logout">
            </el-button>
          </el-tooltip>
        </div>
      </div>
      
      <div class="sync-status-content">
        <div class="last-sync-wrapper" v-if="lastSyncTime">
          <span class="last-sync">
            上次同步: {{ formatTime(lastSyncTime) }}
          </span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import StorageService from '@/services/StorageService'

export default {
  name: 'SyncStatus',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      syncing: false,
      lastSyncTime: null,
      autoSyncTimer: null
    }
  },
  computed: {
    userAvatar() {
      // 可以根据用户邮箱生成头像，这里简化处理
      return `https://api.dicebear.com/6.x/initials/svg?seed=${this.user.username}`;
    }
  },
  mounted() {
    this.updateSyncStatus();
    // 每30秒检查一次同步状态
    setInterval(() => {
      this.updateSyncStatus();
    }, 30000);
  },
  methods: {
    async manualSync() {
      this.syncing = true;
      
      try {
        // 先上传本地数据
        const uploadResult = await StorageService.syncToServer();
        if (uploadResult.success) {
          // 再下载服务器数据
          const downloadResult = await StorageService.syncFromServer();
          if (downloadResult.success) {
            this.lastSyncTime = new Date();
            localStorage.setItem('last-sync-time', this.lastSyncTime.toISOString());
            this.$message.success('数据同步成功');
            this.$emit('sync-success', downloadResult.subscriptions);
          } else {
            throw new Error(downloadResult.error);
          }
        } else {
          throw new Error(uploadResult.error);
        }
      } catch (error) {
        this.$message.error('同步失败: ' + error.message);
      } finally {
        this.syncing = false;
      }
    },
    
    // 自动同步方法
    async autoSync() {
      if (this.syncing) return; // 如果正在同步，跳过
      
      try {
        const uploadResult = await StorageService.syncToServer();
        if (uploadResult.success) {
          const downloadResult = await StorageService.syncFromServer();
          if (downloadResult.success) {
            this.lastSyncTime = new Date();
            localStorage.setItem('last-sync-time', this.lastSyncTime.toISOString());
            this.$emit('sync-success', downloadResult.subscriptions);
          }
        }
      } catch (error) {
        console.error('自动同步失败:', error);
      }
    },
    
    // 监听数据变化，延迟同步
    triggerAutoSync() {
      // 清除之前的定时器
      if (this.autoSyncTimer) {
        clearTimeout(this.autoSyncTimer);
      }
      
      // 设置延迟同步，避免频繁同步
      this.autoSyncTimer = setTimeout(() => {
        this.autoSync();
      }, 3000); // 3秒后自动同步
    },
    
    logout() {
      this.$confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        StorageService.clearUserInfo();
        this.$emit('logout');
        this.$message.success('已退出登录');
      });
    },
    
    updateSyncStatus() {
      // 加载最后同步时间
      const savedTime = localStorage.getItem('last-sync-time');
      if (savedTime) {
        this.lastSyncTime = new Date(savedTime);
      }
    },
    
    formatTime(time) {
      return time.toLocaleString('zh-CN');
    }
  },
  beforeDestroy() {
    // 清理定时器
    if (this.autoSyncTimer) {
      clearTimeout(this.autoSyncTimer);
    }
  },
}
</script>

<style scoped>
.sync-status {
  margin-bottom: 20px;
}

.sync-card {
  border-radius: 8px;
}

.sync-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-details {
  flex: 1;
  margin-left: 12px;
}

.username {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2px;
}

.email {
  font-size: 12px;
  color: #8492a6;
}

.sync-actions {
  display: flex;
  gap: 8px;
}

.sync-status-content {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.last-sync-wrapper {
  display: flex;
  justify-content: flex-end;
}

.last-sync {
  font-size: 12px;
  color: #8492a6;
}
</style>
