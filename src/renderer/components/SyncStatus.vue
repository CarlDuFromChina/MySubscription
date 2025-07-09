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
        <div class="sync-indicator">
          <el-tag 
            :type="syncStatus.type" 
            :icon="syncStatus.icon"
            size="small">
            {{ syncStatus.text }}
          </el-tag>
          <span class="last-sync" v-if="lastSyncTime">
            上次同步: {{ formatTime(lastSyncTime) }}
          </span>
        </div>
        
        <div class="sync-settings">
          <el-switch
            v-model="autoSyncEnabled"
            active-text="自动同步"
            inactive-text="手动同步"
            @change="toggleAutoSync">
          </el-switch>
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
      autoSyncEnabled: true,
      lastSyncTime: null,
      syncStatus: {
        type: 'success',
        icon: 'el-icon-check',
        text: '已同步'
      }
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
            this.syncStatus = {
              type: 'success',
              icon: 'el-icon-check',
              text: '同步成功'
            };
            this.lastSyncTime = new Date();
            this.$message.success('数据同步成功');
            this.$emit('sync-success', downloadResult.subscriptions);
          } else {
            throw new Error(downloadResult.error);
          }
        } else {
          throw new Error(uploadResult.error);
        }
      } catch (error) {
        this.syncStatus = {
          type: 'danger',
          icon: 'el-icon-error',
          text: '同步失败'
        };
        this.$message.error('同步失败: ' + error.message);
      } finally {
        this.syncing = false;
      }
    },
    
    async toggleAutoSync(enabled) {
      // 这里可以保存用户的自动同步偏好
      localStorage.setItem('auto-sync-enabled', enabled.toString());
      if (enabled) {
        this.$message.info('已开启自动同步');
      } else {
        this.$message.info('已关闭自动同步');
      }
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
      // 这里可以检查最后同步时间，判断同步状态
      const savedTime = localStorage.getItem('last-sync-time');
      if (savedTime) {
        this.lastSyncTime = new Date(savedTime);
        const timeDiff = Date.now() - this.lastSyncTime.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
          this.syncStatus = {
            type: 'warning',
            icon: 'el-icon-warning',
            text: '需要同步'
          };
        }
      }
    },
    
    formatTime(time) {
      return time.toLocaleString('zh-CN');
    }
  }
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
  gap: 12px;
}

.user-details {
  flex: 1;
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
  justify-content: space-between;
  align-items: center;
}

.sync-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
}

.last-sync {
  font-size: 12px;
  color: #8492a6;
}

.sync-settings {
  display: flex;
  align-items: center;
}
</style>
