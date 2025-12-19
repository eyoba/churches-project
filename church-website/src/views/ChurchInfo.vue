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

        <!-- Field Labels Customization -->
        <div class="labels-section">
          <h3>Customize Field Labels</h3>
          <p class="section-description">Change how field names appear on your church page (e.g., change "Pastor" to "Priest" or "Father")</p>

          <div class="form-row grid-2">
            <div class="form-group">
              <label for="label_pastor">Label for Pastor Field</label>
              <input
                id="label_pastor"
                v-model="fieldLabels.pastor_name"
                type="text"
                placeholder="Pastor"
                :disabled="saving"
              >
            </div>

            <div class="form-group">
              <label for="label_address">Label for Address Field</label>
              <input
                id="label_address"
                v-model="fieldLabels.address"
                type="text"
                placeholder="Address"
                :disabled="saving"
              >
            </div>

            <div class="form-group">
              <label for="label_phone">Label for Phone Field</label>
              <input
                id="label_phone"
                v-model="fieldLabels.phone"
                type="text"
                placeholder="Phone"
                :disabled="saving"
              >
            </div>

            <div class="form-group">
              <label for="label_email">Label for Email Field</label>
              <input
                id="label_email"
                v-model="fieldLabels.email"
                type="text"
                placeholder="Email"
                :disabled="saving"
              >
            </div>

            <div class="form-group">
              <label for="label_website">Label for Website Field</label>
              <input
                id="label_website"
                v-model="fieldLabels.website"
                type="text"
                placeholder="Website"
                :disabled="saving"
              >
            </div>

            <div class="form-group">
              <label for="label_facebook">Label for Facebook Field</label>
              <input
                id="label_facebook"
                v-model="fieldLabels.facebook"
                type="text"
                placeholder="Facebook"
                :disabled="saving"
              >
            </div>
          </div>
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
          <label for="facebook">Facebook Page</label>
          <input
            id="facebook"
            v-model="church.facebook"
            type="url"
            placeholder="https://www.facebook.com/yourchurch"
            :disabled="saving"
          >
        </div>

        <div class="form-group">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="church.show_members_link"
              :disabled="saving"
            >
            <span>Show Members Login Link on Church Page</span>
          </label>
          <small class="form-help">
            When enabled, a "Medlemssystem / Members Login" button will appear on your church page, making it easy for admins to access the members system.
          </small>
        </div>

        <div class="form-group">
          <label for="background_color">Church Page Background Color</label>
          <div class="color-picker-container">
            <input
              id="background_color"
              type="color"
              v-model="church.background_color"
              class="color-input"
              :disabled="saving"
            >
            <input
              type="text"
              v-model="church.background_color"
              placeholder="#3b82f6"
              pattern="^#[0-9A-Fa-f]{6}$"
              class="color-text-input"
              :disabled="saving"
            >
            <span class="color-preview" :style="{ backgroundColor: church.background_color }"></span>
          </div>
          <small class="form-help">Choose the background color for your church's detail page header</small>
        </div>

        <div class="logo-section">
          <label>Church Logo</label>

          <div class="logo-upload-container">
            <div class="upload-method">
              <h4>Upload from Computer</h4>
              <input
                type="file"
                ref="fileInput"
                @change="handleFileSelect"
                accept="image/*"
                class="file-input"
                :disabled="uploading || saving"
              >
              <button
                type="button"
                @click="uploadLogo"
                class="btn btn-primary btn-sm"
                :disabled="!selectedFile || uploading || saving"
              >
                {{ uploading ? 'Uploading...' : '📤 Upload Logo' }}
              </button>
              <p v-if="selectedFile" class="selected-file">Selected: {{ selectedFile.name }}</p>
            </div>

            <div class="upload-divider">OR</div>

            <div class="upload-method">
              <h4>Enter Logo URL</h4>
              <input
                v-model="church.logo_url"
                type="url"
                placeholder="https://example.com/logo.png"
                :disabled="saving"
              >
            </div>
          </div>

          <small class="form-help">
            Upload directly from your computer or enter an image URL. For best results, use a square image (e.g., 400x400px).
          </small>

          <div v-if="church.logo_url" class="logo-preview">
            <label>Logo Preview:</label>
            <img :src="church.logo_url" alt="Church logo preview" @error="handleImageError">
          </div>
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
        logo_url: '',
        facebook: '',
        background_color: '#3b82f6',
        show_members_link: false
      },
      fieldLabels: {
        pastor_name: 'Pastor',
        address: 'Address',
        phone: 'Phone',
        email: 'Email',
        website: 'Website',
        facebook: 'Facebook'
      },
      originalChurch: null,
      originalLabels: null,
      loading: true,
      saving: false,
      error: null,
      successMessage: null,
      selectedFile: null,
      uploading: false
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
            logo_url: response.data.church.logo_url || '',
            facebook: response.data.church.facebook || '',
            background_color: response.data.church.background_color || '#3b82f6',
            show_members_link: response.data.church.show_members_link || false
          }
          this.originalChurch = { ...this.church }

          // Load field labels if they exist
          console.log('Loaded field_labels from server:', response.data.church.field_labels)
          if (response.data.church.field_labels) {
            const loadedLabels = typeof response.data.church.field_labels === 'string'
              ? JSON.parse(response.data.church.field_labels)
              : response.data.church.field_labels

            console.log('Parsed field labels:', loadedLabels)

            this.fieldLabels = {
              ...this.fieldLabels,
              ...loadedLabels
            }
          }
          console.log('Final fieldLabels:', this.fieldLabels)
          this.originalLabels = { ...this.fieldLabels }
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

        console.log('Saving field labels:', this.fieldLabels)
        console.log('Saving background_color:', this.church.background_color)
        console.log('Full church data being sent:', this.church)

        const response = await axios.put(
          `${API_URL}/church-admin/church-info`,
          {
            ...this.church,
            field_labels: this.fieldLabels
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        )

        console.log('Server response field_labels:', response.data.field_labels)

        this.successMessage = 'Church information updated successfully!'
        this.originalChurch = { ...this.church }
        this.originalLabels = { ...this.fieldLabels }

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
      }
      if (this.originalLabels) {
        this.fieldLabels = { ...this.originalLabels }
      }
      this.error = null
      this.successMessage = null
    },
    handleImageError(event) {
      event.target.style.display = 'none'
      this.error = 'Failed to load logo image. Please check the URL.'
    },
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) {
        if (!file.type.startsWith('image/')) {
          alert('Please select an image file')
          this.$refs.fileInput.value = ''
          return
        }
        if (file.size > 5 * 1024 * 1024) {
          alert('File size must be less than 5MB')
          this.$refs.fileInput.value = ''
          return
        }
        this.selectedFile = file
      }
    },
    async uploadLogo() {
      console.log('Upload logo clicked')
      if (!this.selectedFile) {
        alert('Please select a file first')
        return
      }

      console.log('Selected file:', this.selectedFile)

      try {
        this.uploading = true
        this.error = null

        const token = localStorage.getItem('church_admin_token')
        console.log('Token exists:', !!token)
        if (!token) {
          this.$router.push('/admin/login')
          return
        }

        const formData = new FormData()
        formData.append('logo', this.selectedFile)

        console.log('Uploading to:', `${API_URL}/admin/upload-church-logo`)

        const response = await axios.post(`${API_URL}/admin/upload-church-logo`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        })

        console.log('Upload response:', response.data)

        this.church.logo_url = response.data.url
        this.selectedFile = null
        this.$refs.fileInput.value = ''

        this.successMessage = 'Logo uploaded successfully! Don\'t forget to click "Save Changes" to update your church info.'
        setTimeout(() => {
          this.successMessage = null
        }, 5000)
      } catch (error) {
        console.error('Upload error:', error)
        console.error('Error response:', error.response?.data)
        this.error = error.response?.data?.error || error.message || 'Failed to upload logo'
      } finally {
        this.uploading = false
      }
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

.labels-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--primary-color);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(30, 64, 175, 0.05));
  border-radius: 0.5rem;
  border: 1px solid var(--primary-color);
  border-opacity: 0.1;
}

.labels-section h3 {
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}

.section-description {
  color: var(--gray-600);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.logo-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--gray-50);
  border-radius: 0.5rem;
}

.logo-upload-container {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  margin: 1rem 0;
}

.upload-method {
  flex: 1;
}

.upload-method h4 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: var(--gray-700);
}

.upload-divider {
  font-weight: bold;
  color: var(--gray-400);
  align-self: center;
  padding: 0 1rem;
}

.file-input {
  margin-bottom: 0.75rem;
  display: block;
  width: 100%;
}

.selected-file {
  font-size: 0.875rem;
  color: var(--success-color);
  margin-top: 0.5rem;
}

.logo-preview {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-200);
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

  .logo-upload-container {
    flex-direction: column;
    gap: 1rem;
  }

  .upload-divider {
    align-self: flex-start;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }
}

.color-picker-container {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.color-input {
  width: 60px;
  height: 40px;
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  cursor: pointer;
}

.color-text-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  font-family: monospace;
}

.color-preview {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid var(--gray-300);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;
  color: var(--gray-700);
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.checkbox-label span {
  user-select: none;
}
</style>
