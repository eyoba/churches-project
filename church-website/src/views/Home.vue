<template>
  <div class="home">
    <!-- Hero Section with Logo and Text -->
    <div class="hero" :style="{ background: `linear-gradient(135deg, ${backgroundColor}, ${getSecondaryColor(backgroundColor)})` }">
      <div class="container">
        <div class="hero-content">
          <div class="hero-logo">
            <img v-if="siteLogo" :src="siteLogo" alt="Logo" class="site-logo">
            <div v-else class="site-logo-placeholder">⛪</div>
          </div>
          <div class="hero-text">
            <h2>{{ siteTitle || 'ኤርትራ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን Eritrean Orthodox Tewahedo Church' }}</h2>
            <p class="lead">{{ siteSubtitle || 'Find and connect with churches in your community' }}</p>

            <!-- Church Information Fields -->
            <div v-if="globalFieldLabels && globalChurchInfo && hasAnyGlobalInfo()" class="church-info-grid">
              <div v-if="globalFieldLabels.pastor_name && globalChurchInfo.pastor_name">
                <strong>{{ globalFieldLabels.pastor_name }}:</strong> {{ globalChurchInfo.pastor_name }}
              </div>
              <div v-if="globalFieldLabels.address && globalChurchInfo.address">
                <strong>{{ globalFieldLabels.address }}:</strong> {{ globalChurchInfo.address }}
              </div>
              <div v-if="globalFieldLabels.phone && globalChurchInfo.phone">
                <strong>{{ globalFieldLabels.phone }}:</strong> {{ globalChurchInfo.phone }}
              </div>
              <div v-if="globalFieldLabels.email && globalChurchInfo.email">
                <strong>{{ globalFieldLabels.email }}:</strong> {{ globalChurchInfo.email }}
              </div>
              <div v-if="globalFieldLabels.website && globalChurchInfo.website">
                <strong>{{ globalFieldLabels.website }}:</strong> <a :href="globalChurchInfo.website" target="_blank">{{ globalChurchInfo.website }}</a>
              </div>
              <div v-if="globalFieldLabels.facebook && globalChurchInfo.facebook">
                <strong>{{ globalFieldLabels.facebook }}:</strong> <a :href="globalChurchInfo.facebook" target="_blank">Visit Page</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="container">

      <div v-if="loading" class="spinner"></div>

      <div v-else-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <div v-else>
        <div class="grid grid-2">
          <div v-for="church in churches" :key="church.id" class="card church-card">
            <img v-if="church.logo_url" :src="church.logo_url" :alt="church.name" class="church-logo">
            <div class="church-icon" v-else>⛪</div>

            <h3>{{ church.name }}</h3>
            <p class="church-description">{{ church.description || 'No description available' }}</p>

            <div class="church-info">
              <div v-if="church.pastor_name" class="info-item">
                <strong>{{ getFieldLabel(church, 'pastor_name') }}:</strong> {{ church.pastor_name }}
              </div>
              <div v-if="church.address" class="info-item">
                <strong>{{ getFieldLabel(church, 'address') }}:</strong> {{ church.address }}
              </div>
              <div v-if="church.phone" class="info-item">
                <strong>{{ getFieldLabel(church, 'phone') }}:</strong> {{ church.phone }}
              </div>
              <div v-if="church.facebook" class="info-item">
                <strong>{{ getFieldLabel(church, 'facebook') }}:</strong> <a :href="church.facebook" target="_blank">Visit Page</a>
              </div>
            </div>

            <router-link :to="`/church/${church.slug}`" class="btn btn-primary mt-2">
              View Details
            </router-link>
          </div>
        </div>

        <div v-if="churches.length === 0" class="text-center mt-4">
          <p>No churches found. Please check back later.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export default {
  name: 'Home',
  data() {
    return {
      churches: [],
      loading: true,
      error: null,
      siteLogo: '',
      siteTitle: '',
      siteSubtitle: '',
      homeSectionTitle: '',
      backgroundColor: '#3b82f6',
      globalFieldLabels: null,
      globalChurchInfo: null
    }
  },
  async mounted() {
    // Fetch both in parallel for faster loading
    await Promise.all([
      this.fetchSiteSettings(),
      this.fetchChurches()
    ])
  },
  methods: {
    async fetchSiteSettings() {
      try {
        const response = await axios.get(`${API_URL}/site-settings`)
        this.siteLogo = response.data.site_logo_url || ''
        this.siteTitle = response.data.site_title || ''
        this.siteSubtitle = response.data.site_subtitle || ''
        this.homeSectionTitle = response.data.home_section_title || ''
        this.backgroundColor = response.data.background_color || '#3b82f6'

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
      } catch (err) {
        console.error('Error fetching site settings:', err)
      }
    },
    async fetchChurches() {
      try {
        this.loading = true
        this.error = null
        const response = await axios.get(`${API_URL}/churches`)
        this.churches = response.data
      } catch (err) {
        this.error = err.response?.data?.error || 'Failed to load churches'
        console.error('Error fetching churches:', err)
      } finally {
        this.loading = false
      }
    },
    getFieldLabel(church, fieldName) {
      const defaultLabels = {
        pastor_name: 'Pastor',
        address: 'Address',
        phone: 'Phone',
        email: 'Email',
        website: 'Website',
        facebook: 'Facebook'
      }

      // Priority: church-specific labels > global labels > default labels
      if (church.field_labels) {
        const labels = typeof church.field_labels === 'string'
          ? JSON.parse(church.field_labels)
          : church.field_labels
        if (labels[fieldName]) {
          return labels[fieldName]
        }
      }

      // Use global field labels if available
      if (this.globalFieldLabels && this.globalFieldLabels[fieldName]) {
        return this.globalFieldLabels[fieldName]
      }

      // Fall back to default
      return defaultLabels[fieldName]
    },
    hasAnyLabel() {
      if (!this.globalFieldLabels) return false
      return Object.values(this.globalFieldLabels).some(label => label && label.trim() !== '')
    },
    hasAnyGlobalInfo() {
      if (!this.globalChurchInfo) return false
      return Object.values(this.globalChurchInfo).some(value => value && value.trim() !== '')
    },
    getSecondaryColor(hexColor) {
      // Convert hex to RGB
      const r = parseInt(hexColor.slice(1, 3), 16)
      const g = parseInt(hexColor.slice(3, 5), 16)
      const b = parseInt(hexColor.slice(5, 7), 16)

      // Make it slightly darker for gradient effect
      const darken = (val) => Math.max(0, Math.floor(val * 0.7))

      return `rgb(${darken(r)}, ${darken(g)}, ${darken(b)})`
    }
  }
}
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 2rem 0;
  margin-bottom: 2rem;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  justify-content: center;
}

.hero-logo {
  flex-shrink: 0;
}

.hero-text {
  flex: 1;
  text-align: left;
}

.hero h2 {
  font-size: 1.5rem;
  margin: 0 0 0.75rem 0;
  font-weight: 600;
  line-height: 1.3;
}

.lead {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0 0 1rem 0;
}

.church-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem 1rem;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: white;
}

.church-info-grid div {
  line-height: 1.6;
}

.church-info-grid strong {
  opacity: 0.9;
}

.church-info-grid a {
  color: white;
  text-decoration: underline;
  opacity: 0.95;
}

.church-info-grid a:hover {
  opacity: 1;
}

.site-logo {
  width: 150px;
  height: 150px;
  object-fit: contain;
  background: white;
  padding: 0.5rem;
  border-radius: 50%;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  border: 4px solid rgba(255, 255, 255, 0.9);
  transition: transform 0.3s ease;
}

.site-logo:hover {
  transform: scale(1.05);
}

.site-logo-placeholder {
  font-size: 5rem;
  width: 150px;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  border: 4px solid rgba(255, 255, 255, 0.9);
}

@media (max-width: 992px) {
  .church-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 1.5rem 0;
  }

  .hero-content {
    flex-direction: column;
    text-align: center;
  }

  .hero-text {
    text-align: center;
  }

  .hero h2 {
    font-size: 1.25rem;
  }

  .site-logo,
  .site-logo-placeholder {
    width: 120px;
    height: 120px;
    font-size: 3.5rem;
  }

  .lead {
    font-size: 0.875rem;
  }

  .church-info-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    text-align: left;
    font-size: 0.8rem;
  }
}

.church-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.church-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.church-card h3 {
  font-size: 1.125rem;
  margin: 0 0 0.5rem 0;
}

.church-logo {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 0.5rem;
  margin-bottom: 0.75rem;
  background: #f8f9fa;
}

.church-icon {
  font-size: 3.5rem;
  text-align: center;
  margin-bottom: 0.75rem;
}

.church-description {
  color: var(--gray-600);
  min-height: 2.5rem;
  font-size: 0.875rem;
}

.church-info {
  margin: 0.75rem 0;
  font-size: 0.8rem;
}

.info-item {
  margin-bottom: 0.4rem;
  color: var(--gray-700);
}

.field-labels-info {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border-left: 4px solid var(--primary-color);
}

.field-labels-info h3 {
  margin: 0 0 1rem 0;
  color: var(--gray-800);
  font-size: 1.25rem;
}

.field-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.field-info-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 0;
  color: var(--gray-700);
  font-size: 0.95rem;
}

.field-info-item strong {
  color: var(--gray-800);
  min-width: 100px;
  flex-shrink: 0;
}

.field-info-item span {
  flex: 1;
}

.field-info-item a {
  color: var(--primary-color);
  text-decoration: none;
}

.field-info-item a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .field-info-grid {
    grid-template-columns: 1fr;
  }

  .field-info-item {
    flex-direction: column;
    gap: 0.25rem;
  }

  .field-info-item strong {
    min-width: auto;
  }
}
</style>
