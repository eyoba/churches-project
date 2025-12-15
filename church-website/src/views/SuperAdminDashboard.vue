<template>
  <div class="super-admin-dashboard">
    <div class="header">
      <div>
        <h1>🌟 Super Admin Dashboard</h1>
        <p class="subtitle">Welcome, {{ userName }}</p>
      </div>
      <button @click="logout" class="btn btn-secondary">Logout</button>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <h3>{{ churches.length }}</h3>
        <p>Total Churches</p>
      </div>
      <div class="stat-card">
        <h3>{{ activeChurches }}</h3>
        <p>Active Churches</p>
      </div>
      <div class="stat-card">
        <h3>{{ totalMembers }}</h3>
        <p>Total Members</p>
      </div>
      <div class="stat-card">
        <h3>{{ totalAdmins }}</h3>
        <p>Total Admins</p>
      </div>
    </div>

    <!-- Site Logo Management -->
    <div class="logo-section card">
      <h2>🎨 Site Logo</h2>
      <div class="logo-container">
        <div class="logo-preview">
          <img v-if="siteSettings.site_logo_url" :src="siteSettings.site_logo_url" alt="Site Logo">
          <div v-else class="no-logo">No logo uploaded</div>
        </div>
        <div class="logo-actions">
          <div class="upload-section">
            <h3>Upload from Computer</h3>
            <input
              type="file"
              ref="fileInput"
              @change="handleFileSelect"
              accept="image/*"
              class="file-input"
            >
            <button @click="uploadFile" class="btn btn-primary" :disabled="!selectedFile || uploading">
              {{ uploading ? 'Uploading...' : '📤 Upload Logo' }}
            </button>
            <p v-if="selectedFile" class="selected-file">Selected: {{ selectedFile.name }}</p>
          </div>

          <div class="divider">OR</div>

          <div class="url-section">
            <h3>Enter Logo URL</h3>
            <input
              type="text"
              v-model="logoUrl"
              placeholder="https://example.com/logo.png"
              class="logo-input"
            >
            <button @click="updateLogo" class="btn btn-secondary">Update from URL</button>
          </div>

          <p class="help-text">
            💡 Tip: Upload directly from your computer or paste a URL from an image hosting service.
          </p>
        </div>
      </div>
    </div>

    <!-- Home Page Text Editor -->
    <div class="text-editor-section card">
      <h2>📝 Home Page Text</h2>
      <div class="text-editor-container">
        <div class="form-group">
          <label>Site Title (Main heading)</label>
          <input
            type="text"
            v-model="siteTitle"
            placeholder="Ethiopian Orthodox Tewahedo Church"
            class="text-input"
          >
        </div>

        <div class="form-group">
          <label>Site Subtitle (Below title)</label>
          <input
            type="text"
            v-model="siteSubtitle"
            placeholder="Find and connect with churches in your community"
            class="text-input"
          >
        </div>

        <div class="form-group">
          <label>Navigation Title (Top left corner)</label>
          <input
            type="text"
            v-model="navTitle"
            placeholder="Churches Directory"
            class="text-input"
          >
        </div>

        <div class="form-group">
          <label>Homepage Background Color</label>
          <div class="color-picker-container">
            <input
              type="color"
              v-model="homeBackgroundColor"
              class="color-input"
            >
            <input
              type="text"
              v-model="homeBackgroundColor"
              placeholder="#3b82f6"
              pattern="^#[0-9A-Fa-f]{6}$"
              class="color-text-input"
            >
            <span class="color-preview" :style="{ backgroundColor: homeBackgroundColor }"></span>
          </div>
          <small class="help-text">Choose the background color for the homepage hero section</small>
        </div>

        <button @click="updateHomePageText" class="btn btn-primary">
          💾 Save Home Page Text
        </button>

        <div class="preview-box">
          <h4>Preview:</h4>
          <div class="preview-content">
            <p><strong>Title:</strong> {{ siteTitle || 'Ethiopian Orthodox Tewahedo Church' }}</p>
            <p><strong>Subtitle:</strong> {{ siteSubtitle || 'Find and connect with churches in your community' }}</p>
            <p><strong>Section:</strong> {{ homeSectionTitle || 'Our Churches' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Customize Field Labels -->
    <div class="labels-section">
      <h3>Customize Field Labels</h3>
      <p class="section-description">
        Change how field names appear on your church page (e.g., change "Pastor" to "Priest" or "Father")
      </p>

      <div class="form-row grid-2">
        <div class="form-group">
          <label for="label_pastor">Label for Pastor Field</label>
          <input
            id="label_pastor"
            type="text"
            v-model="globalFieldLabels.pastor_name"
            placeholder="Pastor"
          >
        </div>

        <div class="form-group">
          <label for="label_address">Label for Address Field</label>
          <input
            id="label_address"
            type="text"
            v-model="globalFieldLabels.address"
            placeholder="Address"
          >
        </div>

        <div class="form-group">
          <label for="label_phone">Label for Phone Field</label>
          <input
            id="label_phone"
            type="text"
            v-model="globalFieldLabels.phone"
            placeholder="Phone"
          >
        </div>

        <div class="form-group">
          <label for="label_email">Label for Email Field</label>
          <input
            id="label_email"
            type="text"
            v-model="globalFieldLabels.email"
            placeholder="Email"
          >
        </div>

        <div class="form-group">
          <label for="label_website">Label for Website Field</label>
          <input
            id="label_website"
            type="text"
            v-model="globalFieldLabels.website"
            placeholder="Website"
          >
        </div>

        <div class="form-group">
          <label for="label_facebook">Label for Facebook Field</label>
          <input
            id="label_facebook"
            type="text"
            v-model="globalFieldLabels.facebook"
            placeholder="Facebook"
          >
        </div>
      </div>

      <button @click="updateFieldLabels" class="btn btn-primary">
        💾 Save Field Labels
      </button>

      <h3 style="margin-top: 2rem;">Church Information Values</h3>
      <p class="section-description">
        Enter the actual information for your church (this data will be displayed on the homepage)
      </p>

      <div class="form-row">
        <div class="form-group">
          <label>Pastor Name</label>
          <input
            type="text"
            v-model="globalChurchInfo.pastor_name"
            placeholder="Pastor's full name"
            class="text-input"
          >
        </div>
      </div>

      <div class="form-group">
        <label>Address</label>
        <textarea
          v-model="globalChurchInfo.address"
          placeholder="Full church address"
          rows="2"
          class="text-input"
        ></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            v-model="globalChurchInfo.phone"
            placeholder="(123) 456-7890"
            class="text-input"
          >
        </div>

        <div class="form-group">
          <label>Email Address</label>
          <input
            type="email"
            v-model="globalChurchInfo.email"
            placeholder="contact@church.com"
            class="text-input"
          >
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Website</label>
          <input
            type="url"
            v-model="globalChurchInfo.website"
            placeholder="https://www.yourchurch.com"
            class="text-input"
          >
        </div>

        <div class="form-group">
          <label>Facebook Page</label>
          <input
            type="url"
            v-model="globalChurchInfo.facebook"
            placeholder="https://www.facebook.com/yourchurch"
            class="text-input"
          >
        </div>
      </div>

      <button @click="updateGlobalChurchInfo" class="btn btn-primary">
        💾 Save Field Values
      </button>
    </div>

    <div class="actions">
      <button @click="showAddChurchModal = true" class="btn btn-primary">
        ➕ Add New Church
      </button>
    </div>

    <div class="churches-table">
      <h2>All Churches</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
            <th>Pastor</th>
            <th>Admins</th>
            <th>Members</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="church in churches" :key="church.id">
            <td><strong>{{ church.name }}</strong></td>
            <td><code>{{ church.slug }}</code></td>
            <td>{{ church.pastor_name || 'N/A' }}</td>
            <td>{{ church.admin_count }}</td>
            <td>{{ church.member_count }}</td>
            <td>
              <span :class="['status-badge', church.is_active ? 'active' : 'inactive']">
                {{ church.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="actions-cell">
              <button @click="editChurch(church)" class="btn-small btn-primary">Edit</button>
              <button @click="viewChurchAdmins(church)" class="btn-small btn-secondary">Admins</button>
              <button @click="deleteChurch(church)" class="btn-small btn-danger">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Church Modal -->
    <div v-if="showAddChurchModal || showEditChurchModal" class="modal" @click.self="closeModals">
      <div class="modal-content">
        <h2>{{ showEditChurchModal ? 'Edit Church' : 'Add New Church' }}</h2>
        <form @submit.prevent="saveChurch">
          <div class="form-row">
            <div class="form-group">
              <label>Church Name *</label>
              <input v-model="churchForm.name" required>
            </div>
            <div class="form-group">
              <label>Slug * (URL-friendly)</label>
              <input v-model="churchForm.slug" required placeholder="e.g., first-church">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Pastor Name</label>
              <input v-model="churchForm.pastor_name">
            </div>
            <div class="form-group">
              <label>Pastor Title</label>
              <input v-model="churchForm.pastor_title" placeholder="e.g., Senior Pastor">
            </div>
          </div>

          <div class="form-group">
            <label>Address</label>
            <input v-model="churchForm.address">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Phone</label>
              <input v-model="churchForm.phone">
            </div>
            <div class="form-group">
              <label>Email</label>
              <input v-model="churchForm.email" type="email">
            </div>
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="churchForm.description" rows="3"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Service Times</label>
              <input v-model="churchForm.service_times" placeholder="e.g., Sunday 10:00 AM">
            </div>
            <div class="form-group">
              <label>Website URL</label>
              <input v-model="churchForm.website" placeholder="https://...">
            </div>
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" v-model="churchForm.is_active">
              Active
            </label>
          </div>

          <div v-if="error" class="error-message">{{ error }}</div>

          <div class="modal-actions">
            <button type="button" @click="closeModals" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Church</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Church Admins Modal -->
    <div v-if="showAdminsModal" class="modal" @click.self="closeModals">
      <div class="modal-content">
        <h2>Church Admins: {{ selectedChurch?.name }}</h2>
        
        <button @click="showAddAdminForm = !showAddAdminForm" class="btn btn-primary mb-2">
          {{ showAddAdminForm ? 'Cancel' : '➕ Add Admin' }}
        </button>

        <div v-if="showAddAdminForm" class="admin-form">
          <h3>Add New Admin</h3>
          <form @submit.prevent="saveChurchAdmin">
            <div class="form-group">
              <label>Username *</label>
              <input v-model="adminForm.username" required>
            </div>
            <div class="form-group">
              <label>Password *</label>
              <input v-model="adminForm.password" type="password" required>
            </div>
            <div class="form-group">
              <label>Full Name *</label>
              <input v-model="adminForm.full_name" required>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input v-model="adminForm.email" type="email">
            </div>
            <button type="submit" class="btn btn-primary">Create Admin</button>
          </form>
        </div>

        <table class="mt-2">
          <thead>
            <tr>
              <th>Username</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="admin in churchAdmins" :key="admin.id">
              <td><code>{{ admin.username }}</code></td>
              <td>{{ admin.full_name }}</td>
              <td>{{ admin.email || 'N/A' }}</td>
              <td>
                <span :class="['status-badge', admin.is_active ? 'active' : 'inactive']">
                  {{ admin.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td>{{ formatDate(admin.created_at) }}</td>
            </tr>
          </tbody>
        </table>

        <div class="modal-actions">
          <button @click="closeModals" class="btn btn-secondary">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export default {
  name: 'SuperAdminDashboard',
  data() {
    return {
      churches: [],
      churchAdmins: [],
      selectedChurch: null,
      showAddChurchModal: false,
      showEditChurchModal: false,
      showAdminsModal: false,
      showAddAdminForm: false,
      error: '',
      churchForm: {
        name: '',
        slug: '',
        address: '',
        phone: '',
        email: '',
        pastor_name: '',
        pastor_title: '',
        description: '',
        logo_url: '',
        website: '',
        service_times: '',
        is_active: true,
        background_color: '#3b82f6'
      },
      adminForm: {
        username: '',
        password: '',
        full_name: '',
        email: ''
      },
      siteSettings: {
        site_logo_url: '',
        site_name: ''
      },
      logoUrl: '',
      selectedFile: null,
      uploading: false,
      siteTitle: '',
      siteSubtitle: '',
      navTitle: '',
      homeBackgroundColor: '#3b82f6',
      globalFieldLabels: {
        pastor_name: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        facebook: ''
      },
      globalChurchInfo: {
        pastor_name: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        facebook: ''
      }
    }
  },
  computed: {
    userName() {
      const user = JSON.parse(localStorage.getItem('super_admin_user') || '{}')
      return user.full_name || 'Super Admin'
    },
    activeChurches() {
      return this.churches.filter(c => c.is_active).length
    },
    totalMembers() {
      return this.churches.reduce((sum, c) => sum + parseInt(c.member_count || 0), 0)
    },
    totalAdmins() {
      return this.churches.reduce((sum, c) => sum + parseInt(c.admin_count || 0), 0)
    }
  },
  mounted() {
    this.checkAuth()
    this.fetchChurches()
    this.fetchSiteSettings()
  },
  methods: {
    checkAuth() {
      const token = localStorage.getItem('super_admin_token')
      if (!token) {
        this.$router.push('/super-admin/login')
      }
    },
    async fetchSiteSettings() {
      try {
        const response = await axios.get(`${API_URL}/site-settings`)
        this.siteSettings = response.data
        this.logoUrl = response.data.site_logo_url || ''
        this.siteTitle = response.data.site_title || ''
        this.siteSubtitle = response.data.site_subtitle || ''
        this.navTitle = response.data.nav_title || ''
        this.homeBackgroundColor = response.data.background_color || '#3b82f6'

        // Load global field labels
        if (response.data.global_field_labels) {
          try {
            this.globalFieldLabels = JSON.parse(response.data.global_field_labels)
          } catch (e) {
            console.error('Error parsing global field labels:', e)
          }
        }

        // Load global church info
        if (response.data.global_church_info) {
          try {
            this.globalChurchInfo = JSON.parse(response.data.global_church_info)
          } catch (e) {
            console.error('Error parsing global church info:', e)
          }
        }
      } catch (error) {
        console.error('Error fetching site settings:', error)
      }
    },
    async updateHomePageText() {
      try {
        const token = localStorage.getItem('super_admin_token')

        // Update all text settings
        await Promise.all([
          axios.put(`${API_URL}/super-admin/site-settings`, {
            setting_key: 'site_title',
            setting_value: this.siteTitle
          }, { headers: { Authorization: `Bearer ${token}` } }),

          axios.put(`${API_URL}/super-admin/site-settings`, {
            setting_key: 'site_subtitle',
            setting_value: this.siteSubtitle
          }, { headers: { Authorization: `Bearer ${token}` } }),

          axios.put(`${API_URL}/super-admin/site-settings`, {
            setting_key: 'nav_title',
            setting_value: this.navTitle
          }, { headers: { Authorization: `Bearer ${token}` } }),

          axios.put(`${API_URL}/super-admin/site-settings`, {
            setting_key: 'background_color',
            setting_value: this.homeBackgroundColor
          }, { headers: { Authorization: `Bearer ${token}` } })
        ])

        alert('Home page text updated successfully!')
        await this.fetchSiteSettings()
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to update home page text')
      }
    },
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert('Please select an image file')
          this.$refs.fileInput.value = ''
          return
        }
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('File size must be less than 5MB')
          this.$refs.fileInput.value = ''
          return
        }
        this.selectedFile = file
      }
    },
    async uploadFile() {
      if (!this.selectedFile) {
        alert('Please select a file first')
        return
      }

      this.uploading = true
      try {
        const token = localStorage.getItem('super_admin_token')
        const formData = new FormData()
        formData.append('logo', this.selectedFile)

        const response = await axios.post(`${API_URL}/super-admin/upload-logo`, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        })

        this.siteSettings.site_logo_url = response.data.url
        this.logoUrl = response.data.url
        this.selectedFile = null
        this.$refs.fileInput.value = ''

        alert('Logo uploaded successfully!')
        await this.fetchSiteSettings()
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to upload logo')
      } finally {
        this.uploading = false
      }
    },
    async updateLogo() {
      if (!this.logoUrl.trim()) {
        alert('Please enter a logo URL')
        return
      }

      try {
        const token = localStorage.getItem('super_admin_token')
        await axios.put(`${API_URL}/super-admin/site-settings`, {
          setting_key: 'site_logo_url',
          setting_value: this.logoUrl
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })

        this.siteSettings.site_logo_url = this.logoUrl
        alert('Logo updated successfully!')
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to update logo')
      }
    },
    async updateFieldLabels() {
      try {
        const token = localStorage.getItem('super_admin_token')

        // Save global field labels as JSON string
        await axios.put(`${API_URL}/super-admin/site-settings`, {
          setting_key: 'global_field_labels',
          setting_value: JSON.stringify(this.globalFieldLabels)
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })

        alert('✅ Field labels updated successfully! These labels will now appear on all church pages.')
        await this.fetchSiteSettings()
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to update field labels')
      }
    },
    async updateGlobalChurchInfo() {
      try {
        const token = localStorage.getItem('super_admin_token')

        // Save global church info as JSON string
        await axios.put(`${API_URL}/super-admin/site-settings`, {
          setting_key: 'global_church_info',
          setting_value: JSON.stringify(this.globalChurchInfo)
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })

        alert('✅ Church information updated successfully!')
        await this.fetchSiteSettings()
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to update church information')
      }
    },
    async fetchChurches() {
      try {
        const token = localStorage.getItem('super_admin_token')
        const response = await axios.get(`${API_URL}/super-admin/churches`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.churches = response.data
      } catch (error) {
        if (error.response?.status === 403 || error.response?.status === 401) {
          this.$router.push('/super-admin/login')
        }
        console.error('Error fetching churches:', error)
      }
    },
    editChurch(church) {
      this.selectedChurch = church
      this.churchForm = { ...church }
      this.showEditChurchModal = true
    },
    async saveChurch() {
      try {
        const token = localStorage.getItem('super_admin_token')
        const headers = { Authorization: `Bearer ${token}` }
        
        if (this.showEditChurchModal) {
          await axios.put(`${API_URL}/super-admin/churches/${this.selectedChurch.id}`, this.churchForm, { headers })
        } else {
          await axios.post(`${API_URL}/super-admin/churches`, this.churchForm, { headers })
        }
        
        this.closeModals()
        this.fetchChurches()
        this.resetChurchForm()
      } catch (error) {
        this.error = error.response?.data?.error || 'Failed to save church'
      }
    },
    async deleteChurch(church) {
      if (!confirm(`Are you sure you want to delete ${church.name}? This cannot be undone.`)) {
        return
      }
      
      try {
        const token = localStorage.getItem('super_admin_token')
        await axios.delete(`${API_URL}/super-admin/churches/${church.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.fetchChurches()
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to delete church')
      }
    },
    async viewChurchAdmins(church) {
      this.selectedChurch = church
      this.showAdminsModal = true
      
      try {
        const token = localStorage.getItem('super_admin_token')
        const response = await axios.get(`${API_URL}/super-admin/churches/${church.id}/admins`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.churchAdmins = response.data
      } catch (error) {
        console.error('Error fetching admins:', error)
      }
    },
    async saveChurchAdmin() {
      try {
        const token = localStorage.getItem('super_admin_token')
        await axios.post(`${API_URL}/super-admin/churches/${this.selectedChurch.id}/admins`, this.adminForm, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        this.showAddAdminForm = false
        this.resetAdminForm()
        this.viewChurchAdmins(this.selectedChurch)
      } catch (error) {
        alert(error.response?.data?.error || 'Failed to create admin')
      }
    },
    closeModals() {
      this.showAddChurchModal = false
      this.showEditChurchModal = false
      this.showAdminsModal = false
      this.showAddAdminForm = false
      this.error = ''
      this.resetChurchForm()
      this.resetAdminForm()
    },
    resetChurchForm() {
      this.churchForm = {
        name: '',
        slug: '',
        address: '',
        phone: '',
        email: '',
        pastor_name: '',
        pastor_title: '',
        description: '',
        logo_url: '',
        website: '',
        service_times: '',
        is_active: true
      }
    },
    resetAdminForm() {
      this.adminForm = {
        username: '',
        password: '',
        full_name: '',
        email: ''
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
    logout() {
      localStorage.removeItem('super_admin_token')
      localStorage.removeItem('super_admin_user')
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.super-admin-dashboard {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h1 {
  color: #333;
  margin: 0;
}

.subtitle {
  color: #666;
  margin-top: 0.25rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 10px;
  text-align: center;
}

.stat-card h3 {
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
}

.stat-card p {
  margin: 0;
  opacity: 0.9;
}

.logo-section {
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.logo-section h2 {
  margin-top: 0;
}

.logo-container {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 2rem;
  align-items: start;
}

.logo-preview {
  width: 200px;
  height: 200px;
  border: 2px dashed #ddd;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #f9f9f9;
}

.logo-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.no-logo {
  color: #999;
  text-align: center;
  padding: 1rem;
}

.logo-actions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.upload-section,
.url-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.upload-section h3,
.url-section h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #333;
}

.file-input {
  padding: 0.75rem;
  border: 2px dashed #ddd;
  border-radius: 5px;
  background: #f9f9f9;
  cursor: pointer;
}

.file-input:hover {
  border-color: #667eea;
  background: #f0f7ff;
}

.selected-file {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
  padding: 0.5rem;
  background: #e8f5e9;
  border-radius: 4px;
}

.divider {
  text-align: center;
  color: #999;
  font-weight: 600;
  padding: 0.5rem 0;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: #ddd;
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.logo-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.help-text {
  color: #666;
  font-size: 0.875rem;
  margin: 0;
  padding: 0.5rem;
  background: #f0f7ff;
  border-radius: 5px;
}

.card {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.text-editor-section {
  margin-bottom: 2rem;
}

.text-editor-section h2 {
  margin-top: 0;
}

.text-editor-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.text-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.preview-box {
  background: #f0f7ff;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.preview-box h4 {
  margin: 0 0 1rem 0;
  color: #667eea;
}

.preview-content p {
  margin: 0.5rem 0;
  color: #333;
}

.actions {
  margin-bottom: 2rem;
}

.churches-table {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

code {
  background: #f0f0f0;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-size: 0.9em;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-badge.active {
  background: #d4edda;
  color: #155724;
}

.status-badge.inactive {
  background: #f8d7da;
  color: #721c24;
}

.actions-cell {
  white-space: nowrap;
}

.btn-small {
  padding: 0.35rem 0.75rem;
  font-size: 0.85rem;
  margin-right: 0.5rem;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
}

.btn-danger:hover {
  background: #c82333;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: flex-end;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 5px;
  margin: 1rem 0;
}

.mb-2 {
  margin-bottom: 1rem;
}

.mt-2 {
  margin-top: 1rem;
}

.admin-form {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.admin-form h3 {
  margin-top: 0;
}

.color-picker-container {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.color-input {
  width: 60px;
  height: 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.color-text-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: monospace;
}

.color-preview {
  width: 40px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.help-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #666;
}

/* Labels Section Styling (matching ChurchInfo.vue) */
.labels-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(30, 64, 175, 0.05));
  border-radius: 0.5rem;
  border: 1px solid rgba(37, 99, 235, 0.1);
}

.labels-section h3 {
  color: #2563eb;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}

.section-description {
  color: #666;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 768px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}

.two-column-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.labels-editor,
.labels-preview {
  display: flex;
  flex-direction: column;
}

.labels-editor h3,
.labels-preview h3 {
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  color: var(--gray-800);
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 0.5rem;
}

.labels-preview {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e0e0e0;
}

.labels-preview .preview-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.labels-preview .preview-item {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.labels-preview .preview-item:last-child {
  border-bottom: none;
}

.labels-preview .preview-item strong {
  min-width: 100px;
  color: var(--gray-800);
  flex-shrink: 0;
}

.labels-preview .preview-item span {
  flex: 1;
  color: var(--gray-700);
}

.labels-preview .preview-item a {
  color: var(--primary-color);
  text-decoration: none;
}

.labels-preview .preview-item a:hover {
  text-decoration: underline;
}

.labels-preview .text-gray {
  color: #999;
  font-style: italic;
}

@media (max-width: 968px) {
  .two-column-layout {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
