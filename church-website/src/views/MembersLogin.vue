<template>
  <div class="members-login">
    <div class="login-container">
      <div class="login-card">
        <h2>Debre Iyesus Medlemssystem Innlogging</h2>
        <p class="subtitle">Logg inn for å administrere kirkens medlemmer</p>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label for="username">Brukernavn</label>
            <input
              type="text"
              id="username"
              v-model="credentials.username"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label for="password">Passord</label>
            <input
              type="password"
              id="password"
              v-model="credentials.password"
              required
              :disabled="isLoading"
            />
          </div>

          <div v-if="errorMessage" class="alert alert-error">
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary btn-block" :disabled="isLoading">
            {{ isLoading ? 'Logger inn...' : 'Logg inn' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import membersService from '../services/membersService'

export default {
  name: 'MembersLogin',
  data() {
    return {
      credentials: {
        username: '',
        password: ''
      },
      isLoading: false,
      errorMessage: ''
    }
  },
  methods: {
    async handleLogin() {
      this.isLoading = true
      this.errorMessage = ''

      try {
        await membersService.login(this.credentials.username, this.credentials.password)
        this.$router.push('/members/dashboard')
      } catch (error) {
        console.error('Login error:', error)
        this.errorMessage = error.response?.data?.error || 'Feil brukernavn eller passord'
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
.members-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.login-card h2 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: var(--gray-900);
  text-align: center;
}

.subtitle {
  text-align: center;
  color: var(--gray-600);
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--gray-700);
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background-color: var(--gray-100);
  cursor: not-allowed;
}

.btn-block {
  width: 100%;
}

.alert-error {
  background-color: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}
</style>
