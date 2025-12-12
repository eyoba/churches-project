<template>
  <div class="admin-login">
    <div class="container">
      <div class="login-container">
        <div class="card login-card">
          <div class="text-center mb-4">
            <h1>Church Admin Login</h1>
            <p class="text-gray">Sign in to manage your church information</p>
          </div>

          <div v-if="error" class="alert alert-error">
            {{ error }}
          </div>

          <div v-if="success" class="alert alert-success">
            {{ success }}
          </div>

          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label for="username">Username</label>
              <input
                id="username"
                v-model="username"
                type="text"
                placeholder="admin.first"
                required
                :disabled="loading"
              >
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <input
                id="password"
                v-model="password"
                type="password"
                placeholder="Enter your password"
                required
                :disabled="loading"
              >
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-lg"
              style="width: 100%"
              :disabled="loading"
            >
              <span v-if="loading">Signing in...</span>
              <span v-else>Sign In</span>
            </button>
          </form>

          <div class="login-footer">
            <p class="text-center mt-3">
              <router-link to="/">Back to Home</router-link>
            </p>
          </div>
        </div>

        <div class="info-box card mt-3">
          <h3>For Church Administrators</h3>
          <p>If you don't have login credentials, please contact the system administrator to set up your church admin account.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export default {
  name: 'AdminLogin',
  data() {
    return {
      username: '',
      password: '',
      loading: false,
      error: null,
      success: null
    }
  },
  mounted() {
    // Check if already logged in
    const token = localStorage.getItem('church_admin_token')
    if (token) {
      this.$router.push('/admin/dashboard')
    }
  },
  methods: {
    async handleLogin() {
      if (!this.username || !this.password) {
        this.error = 'Please enter both username and password'
        return
      }

      try {
        this.loading = true
        this.error = null
        this.success = null

        const response = await axios.post(`${API_URL}/church-admin/login`, {
          username: this.username,
          password: this.password
        })

        if (response.data.token) {
          // Store token and user info
          localStorage.setItem('church_admin_token', response.data.token)
          localStorage.setItem('church_admin_user', JSON.stringify(response.data.admin || {}))

          this.success = 'Login successful! Redirecting...'

          // Emit login event and redirect to dashboard
          this.$emit('login')
          setTimeout(() => {
            this.$router.push('/admin/dashboard').then(() => {
              // Force page reload to update the layout
              window.location.reload()
            })
          }, 500)
        } else {
          this.error = 'Login failed. Please try again.'
        }
      } catch (err) {
        this.error = err.response?.data?.error || 'Invalid email or password'
        console.error('Login error:', err)
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  padding: 2rem 0;
}

.login-container {
  max-width: 450px;
  margin: 0 auto;
  width: 100%;
}

.login-card {
  padding: 2.5rem;
}

.text-gray {
  color: var(--gray-600);
  margin-bottom: 0;
}

.login-footer a {
  color: var(--primary-color);
  text-decoration: none;
}

.login-footer a:hover {
  text-decoration: underline;
}

.info-box {
  padding: 1.5rem;
  background-color: rgba(255, 255, 255, 0.95);
}

.info-box h3 {
  font-size: 1.125rem;
  margin-bottom: 0.75rem;
  color: var(--gray-800);
}

.info-box p {
  margin: 0;
  color: var(--gray-600);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .admin-login {
    padding: 1rem 0;
  }

  .login-card {
    padding: 1.5rem;
  }

  .login-container {
    padding: 0 1rem;
  }
}
</style>
