// 本地存储服务
class StorageService {
  constructor() {
    this.storageKey = 'subscription-data';
    this.userKey = 'user-info';
    this.syncEnabled = false;
    this.apiBaseUrl = process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000/api'; // 后端API地址
  }

  // 获取用户信息
  getUserInfo() {
    try {
      const data = localStorage.getItem(this.userKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading user info:', error);
      return null;
    }
  }

  // 保存用户信息
  saveUserInfo(userInfo) {
    try {
      localStorage.setItem(this.userKey, JSON.stringify(userInfo));
      this.syncEnabled = true;
      return true;
    } catch (error) {
      console.error('Error saving user info:', error);
      return false;
    }
  }

  // 清除用户信息（登出）
  clearUserInfo() {
    localStorage.removeItem(this.userKey);
    this.syncEnabled = false;
  }

  // 清除本地数据（登出时使用）
  clearLocalData() {
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.userKey);
    this.syncEnabled = false;
  }

  // 用户注册
  async register(email, password, username) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username })
      });

      const data = await response.json();
      
      if (response.ok) {
        this.saveUserInfo(data.user);
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: '注册失败，请稍后重试' };
    }
  }

  // 用户登录
  async login(email, password) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (response.ok) {
        this.saveUserInfo(data.user);
        // 登录成功后立即同步数据
        await this.syncFromServer();
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: '登录失败，请稍后重试' };
    }
  }

  // 同步数据到服务器
  async syncToServer() {
    if (!this.syncEnabled) return { success: false, error: '未登录' };
    
    const user = this.getUserInfo();
    if (!user || !user.token) return { success: false, error: '认证失败' };

    try {
      const subscriptions = this.getSubscriptions();
      const response = await fetch(`${this.apiBaseUrl}/sync/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ subscriptions })
      });

      const data = await response.json();
      
      if (response.ok) {
        return { success: true, message: '数据同步成功' };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Sync to server error:', error);
      return { success: false, error: '同步失败，请稍后重试' };
    }
  }

  // 从服务器同步数据
  async syncFromServer() {
    if (!this.syncEnabled) return { success: false, error: '未登录' };
    
    const user = this.getUserInfo();
    if (!user || !user.token) return { success: false, error: '认证失败' };

    try {
      const response = await fetch(`${this.apiBaseUrl}/sync/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        // 从服务器同步数据时，直接保存到本地，不触发自动同步
        localStorage.setItem(this.storageKey, JSON.stringify(data.subscriptions));
        return { success: true, subscriptions: data.subscriptions };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Sync from server error:', error);
      return { success: false, error: '同步失败，请稍后重试' };
    }
  }

  // 自动同步（在数据变更时调用）
  async autoSync() {
    if (this.syncEnabled) {
      try {
        await this.syncToServer();
      } catch (error) {
        console.warn('Auto sync failed:', error);
        // 自动同步失败时不显示错误信息，避免干扰用户
      }
    }
  }

  // 获取所有订阅数据
  getSubscriptions() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      return [];
    }
  }

  // 保存订阅数据
  saveSubscriptions(subscriptions) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(subscriptions));
      // 只有在启用同步时才自动同步到服务器
      if (this.syncEnabled) {
        this.autoSync();
      }
      return true;
    } catch (error) {
      console.error('Error saving subscriptions:', error);
      return false;
    }
  }

  // 导出数据
  exportData() {
    const subscriptions = this.getSubscriptions();
    const dataStr = JSON.stringify(subscriptions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `subscriptions_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }

  // 导入数据
  importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const subscriptions = JSON.parse(e.target.result);
          this.saveSubscriptions(subscriptions);
          resolve(subscriptions);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  // 使用 Electron 原生对话框导入数据
  async importDataElectron() {
    if (typeof window.require === 'function') {
      try {
        // 使用 remote 方式（Electron）
        const { remote } = window.require('electron');
        if (!remote) {
          throw new Error('Electron remote 模块不可用');
        }
        
        const dialog = remote.dialog;
        const fs = window.require('fs');
        
        const result = await dialog.showOpenDialog(remote.getCurrentWindow(), {
          properties: ['openFile'],
          filters: [
            { name: 'JSON Files', extensions: ['json'] }
          ]
        });

        console.log('Dialog result:', result);

        // 处理不同版本的返回格式
        let filePaths;
        if (result.canceled) {
          return null; // 用户取消了选择
        }
        
        if (result.filePaths) {
          filePaths = result.filePaths;
        } else if (Array.isArray(result)) {
          filePaths = result; // 旧版本直接返回文件路径数组
        } else {
          throw new Error('无法获取文件路径');
        }

        if (!filePaths || filePaths.length === 0) {
          return null;
        }

        const filePath = filePaths[0];
        console.log('读取文件:', filePath);
        
        const fileContent = fs.readFileSync(filePath, 'utf8');
        console.log('文件内容长度:', fileContent.length);
        
        if (!fileContent.trim()) {
          throw new Error('文件内容为空');
        }
        
        const subscriptions = JSON.parse(fileContent);
        console.log('解析后的数据:', subscriptions);
        
        if (!Array.isArray(subscriptions)) {
          throw new Error('文件内容不是有效的数组格式');
        }
        
        return subscriptions;
        
      } catch (error) {
        console.error('Electron 导入错误:', error);
        throw new Error(`文件读取或解析失败: ${error.message}`);
      }
    } else {
      throw new Error('Electron 环境不可用');
    }
  }
}

export default new StorageService();
