<template>
  <div class="church-info">
    <div class="page-header">
      <h1>Church Information</h1>
      <p>Update your church details and contact information</p>
    </div>

    <div v-if="loading && !church" class="spinner"></div>

    <div v-else-if="error && !church" class="alert alert-error">
      {{ error }}
    </div>

    <div v-else class="card">
      <div v-if="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>

      <div v-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="form-row">
          <div class="form-group">
            <label for="name">Church Name *</label>
            <input
              id="name"
              v-model="church.name"
              type="text"
              placeholder="Enter church name"
              required
              :disabled="saving"
            >
          </div>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea
            id="description"
            v-model="church.description"
            placeholder="Brief description of your church"
            rows="4"
            :disabled="saving"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="pastor_name">Pastor Name</label>
            <input
              id="pastor_name"
              v-model="church.pastor_name"
              type="text"
              placeholder="Pastor's full name"
              :disabled="saving"
            >
          </div>
        </div>

        <div class="form-group">
          <label for="address">Address</label>
          <textarea
            id="address"
            v-model="church.address"
            placeholder="Full church address"
            rows="2"
            :disabled="saving"
          ></textarea>
        </div>

        <div class="form-row grid-2">
          <div class="form-group">
            <label for="phone">Phone Number</label>
            <input
              id="phone"
              v-model="church.phone"
              type="tel"
              placeholder="(123) 456-7890"
              :disabled="saving"
            >
          </div>

          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              v-model="church.email"
              type="email"
              placeholder="contact@church.com"
              :disabled="saving"
            >
          </div>
        </div>

        <div class="form-group">
          <label for="website">Website</label>
          <input
            id="website"
            v-model="church.website"
            type="url"
            placeholder="https://www.yourchurch.com"
            :disabled="saving"
          >
        </div>

        <div class="form-group">
          <label for="logo_url">Logo URL</label>
          <input
            id="logo_url"
            v-model="church.logo_url"
            type="url"
            placeholder="https://example.com/logo.png"
            :disabled="saving"
          >
          <small class="form-help">
            Enter the URL of your church logo image. For best results, use a square image (e.g., 400x400px).
          </small>
        </div>

        <div v-if="church.logo_url" class="logo-preview">
          <label>Logo Preview:</label>
          <img :src="church.logo_url" alt="Church logo preview" @error="handleImageError">
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="saving"
          >
            <span v-if="saving">Saving Changes...</span>
            <span v-else>Save Changes</span>
          </button>

          <button
            type="button"
            class="btn btn-secondary"
            @click="resetForm"
            :disabled="saving"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export default {
  name: 'ChurchInfo',
  data() {
    return {
      church: {
        name: '',
        description: '',
        pastor_name: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        logo_url: ''
      },
      originalChurch: null,
      loading: true,
      saving: false,
      error: null,
      successMessage: null
    }
  },
  async mounted() {
    await this.fetchChurchInfo()
  },
  methods: {
    async fetchChurchInfo() {
      try {
        this.loading = true
        this.error = null

        const token = localStorage.getItem('church_admin_token')
        if (!token) {
          this.$router.push('/admin/login')
          return
        }

        const response = await axios.get(`${API_URL}/church-admin/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (response.data.church) {
          this.church = {
            name: response.data.church.name || '',
            description: response.data.church.description || '',
            pastor_name: response.data.church.pastor_name || '',
            address: response.data.church.address || '',
            phone: response.data.church.phone || '',
            email: response.data.church.email || '',
            website: response.data.church.website || '',
            logo_url: response.data.church.logo_url || ''
          }
          this.originalChurch = { ...this.church }
        }
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('church_admin_token')
          localStorage.removeItem('church_admin_user')
          this.$router.push('/admin/login')
        } else {
          this.error = err.response?.data?.error || 'Failed to load church information'
        }
        console.error('Error fetching church info:', err)
      } finally {
        this.loading = false
      }
    },
    async handleSubmit() {
      if (!this.church.name.trim()) {
        this.error = 'Church name is required'
        return
      }

      try {
        this.saving = true
        this.error = null
        this.successMessage = null

        const token = localStorage.getItem('church_admin_token')
        if (!token) {
          this.$router.push('/admin/login')
          return
        }

        await axios.put(
          `${API_URL}/church-admin/church-info`,
          this.church,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )

        this.successMessage = 'Church information updated successfully!'
        this.originalChurch = { ...this.church }

        // Update user info in localStorage
        const user = JSON.parse(localStorage.getItem('church_admin_user') || '{}')
        user.church_name = this.church.name
        localStorage.setItem('church_admin_user', JSON.stringify(user))

        // Clear success message after 5 seconds
        setTimeout(() => {
          this.successMessage = null
        }, 5000)
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('church_admin_token')
          localStorage.removeItem('church_admin_user')
          this.$router.push('/admin/login')
        } else {
          this.error = err.response?.data?.error || 'Failed to update church information'
        }
        console.error('Error updating church info:', err)
      } finally {
        this.saving = false
      }
    },
    resetForm() {
      if (this.originalChurch) {
        this.church = { ...this.originalChurch }
        this.error = null
        this.successMessage = null
      }
    },
    handleImageError(event) {
      event.target.style.display = 'none'
      this.error = 'Failed to load logo image. Please check the URL.'
    }
  }
}
</script>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  margin-bottom: 0.5rem;
}

.page-header p {
  color: var(--gray-600);
  margin: 0;
}

.form-row {
  display: grid;
  gap: 1.5rem;
}

.form-row.grid-2 {
  grid-template-columns: 1fr 1fr;
}

.form-help {
  display: block;
  margin-top: 0.5rem;
  color: var(--gray-500);
  font-size: 0.875rem;
}

.logo-preview {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--gray-50);
  border-radius: 0.5rem;
}

.logo-preview label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.logo-preview img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 0.5rem;
  border: 2px solid var(--gray-200);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--gray-200);
}

@media (max-width: 768px) {
  .form-row.grid-2 {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
