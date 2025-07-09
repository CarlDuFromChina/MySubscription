<template>
  <div class="auth-container">
    <el-card class="auth-card">
      <div slot="header" class="auth-header">
        <h2>{{ isLogin ? '登录' : '注册' }}</h2>
      </div>
      
      <el-form 
        ref="authForm" 
        :model="authForm" 
        :rules="authRules" 
        label-width="80px"
        @submit.native.prevent="handleSubmit">
        
        <el-form-item label="邮箱" prop="email">
          <el-input 
            v-model="authForm.email" 
            type="email" 
            placeholder="请输入邮箱"
            prefix-icon="el-icon-message">
          </el-input>
        </el-form-item>
        
        <el-form-item v-if="!isLogin" label="用户名" prop="username">
          <el-input 
            v-model="authForm.username" 
            placeholder="请输入用户名"
            prefix-icon="el-icon-user">
          </el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="authForm.password" 
            type="password" 
            placeholder="请输入密码"
            prefix-icon="el-icon-lock"
            show-password>
          </el-input>
        </el-form-item>
        
        <el-form-item v-if="!isLogin" label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="authForm.confirmPassword" 
            type="password" 
            placeholder="请再次输入密码"
            prefix-icon="el-icon-lock"
            show-password>
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            :loading="loading" 
            @click="handleSubmit"
            style="width: 100%;">
            {{ isLogin ? '登录' : '注册' }}
          </el-button>
        </el-form-item>
        
        <div class="auth-switch">
          <el-button 
            type="text" 
            @click="toggleAuthMode">
            {{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}
          </el-button>
          <br>
          <el-button 
            type="text" 
            @click="skipLogin"
            style="font-size: 12px; color: #909399;">
            暂时跳过，使用本地模式
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import StorageService from '@/services/StorageService'

export default {
  name: 'AuthComponent',
  data() {
    return {
      isLogin: true,
      loading: false,
      authForm: {
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
      },
      authRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] }
        ],
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: this.validatePassword, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    validatePassword(rule, value, callback) {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.authForm.password) {
        callback(new Error('两次输入密码不一致'));
      } else {
        callback();
      }
    },
    
    toggleAuthMode() {
      this.isLogin = !this.isLogin;
      this.resetForm();
    },
    
    resetForm() {
      this.authForm = {
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
      };
      if (this.$refs.authForm) {
        this.$refs.authForm.resetFields();
      }
    },
    
    async handleSubmit() {
      this.$refs.authForm.validate(async (valid) => {
        if (valid) {
          this.loading = true;
          
          try {
            let result;
            if (this.isLogin) {
              result = await StorageService.login(this.authForm.email, this.authForm.password);
            } else {
              result = await StorageService.register(
                this.authForm.email, 
                this.authForm.password, 
                this.authForm.username
              );
            }
            
            if (result.success) {
              this.$message.success(this.isLogin ? '登录成功' : '注册成功');
              this.$emit('auth-success', result.user);
            } else {
              this.$message.error(result.error);
            }
          } catch (error) {
            this.$message.error('操作失败，请稍后重试');
          } finally {
            this.loading = false;
          }
        }
      });
    },
    
    // 跳过登录，使用本地模式
    skipLogin() {
      this.$emit('skip-auth');
    }
  }
}
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.auth-header {
  text-align: center;
}

.auth-header h2 {
  margin: 0;
  color: #2c3e50;
  font-weight: 600;
}

.auth-switch {
  text-align: center;
  margin-top: 20px;
}

.el-form-item {
  margin-bottom: 20px;
}
</style>
