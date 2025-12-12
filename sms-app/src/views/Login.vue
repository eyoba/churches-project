<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <h1>Church SMS Manager</h1>
        <p>Sign in to manage and send SMS messages</p>
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            v-model="username"
            class="form-input"
            placeholder="admin.first"
            required
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            v-model="password"
            class="form-input"
            placeholder="Enter your password"
            required
            autocomplete="current-password"
          />
        </div>

        <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>

      <div class="install-prompt" v-if="showInstallPrompt">
        <p>Install this app for quick access</p>
        <button @click="installApp" class="btn btn-secondary btn-small">
          Install App
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      error: '',
      loading: false,
      deferredPrompt: null,
      showInstallPrompt: false
    };
  },
  mounted() {
    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt = true;
    });
  },
  methods: {
    async handleLogin() {
      this.error = '';
      this.loading = true;

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const response = await axios.post(`${apiUrl}/church-admin/login`, {
          username: this.username,
          password: this.password
        });

        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('churchId', response.data.churchId);
          localStorage.setItem('adminName', response.data.name || 'Admin');

          this.$router.push('/sms-manager');
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Login failed. Please check your credentials.';
      } finally {
        this.loading = false;
      }
    },
    async installApp() {
      if (!this.deferredPrompt) return;

      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        this.showInstallPrompt = false;
      }

      this.deferredPrompt = null;
    }
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: white;
  border-radius: 16px;
  padding: 3rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 450px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  font-size: 2rem;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #6b7280;
  font-size: 1rem;
}

.btn-full {
  width: 100%;
}

.install-prompt {
  margin-top: 2rem;
  padding: 1rem;
  background: #eff6ff;
  border-radius: 8px;
  text-align: center;
}

.install-prompt p {
  margin-bottom: 0.75rem;
  color: #1e40af;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .login-card {
    padding: 2rem;
  }

  .login-header h1 {
    font-size: 1.5rem;
  }
}
</style>
