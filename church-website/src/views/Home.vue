<template>
  <div class="home">
    <!-- Hero Section with Logo and Text -->
    <div class="hero">
      <div class="container">
        <div class="hero-content">
          <div class="hero-logo">
            <img v-if="siteLogo" :src="siteLogo" alt="Logo" class="site-logo">
            <div v-else class="site-logo-placeholder">⛪</div>
          </div>
          <div class="hero-text">
            <h2>{{ siteTitle || 'ኤርትራ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን Eritrean Orthodox Tewahedo Church' }}</h2>
            <p class="lead">{{ siteSubtitle || 'Find and connect with churches in your community' }}</p>
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
      homeSectionTitle: ''
    }
  },
  async mounted() {
    await this.fetchSiteSettings()
    await this.fetchChurches()
  },
  methods: {
    async fetchSiteSettings() {
      try {
        const response = await axios.get(`${API_URL}/site-settings`)
        this.siteLogo = response.data.site_logo_url || ''
        this.siteTitle = response.data.site_title || ''
        this.siteSubtitle = response.data.site_subtitle || ''
        this.homeSectionTitle = response.data.home_section_title || ''
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

      if (church.field_labels) {
        const labels = typeof church.field_labels === 'string'
          ? JSON.parse(church.field_labels)
          : church.field_labels
        return labels[fieldName] || defaultLabels[fieldName]
      }

      return defaultLabels[fieldName]
    }
  }
}
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 3rem 0;
  margin-bottom: 3rem;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 2rem;
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
  font-size: 2rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
  line-height: 1.4;
}

.lead {
  font-size: 1.25rem;
  opacity: 0.9;
  margin: 0;
}

.site-logo {
  width: 220px;
  height: 220px;
  object-fit: contain;
  background: white;
  padding: 0.5rem;
  border-radius: 50%;
  box-shadow: 0 8px 30px rgba(0,0,0,0.2);
  border: 5px solid rgba(255, 255, 255, 0.9);
  transition: transform 0.3s ease;
}

.site-logo:hover {
  transform: scale(1.05);
}

.site-logo-placeholder {
  font-size: 7rem;
  width: 220px;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 50%;
  box-shadow: 0 8px 30px rgba(0,0,0,0.2);
  border: 5px solid rgba(255, 255, 255, 0.9);
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
  }

  .hero-text {
    text-align: center;
  }

  .hero h2 {
    font-size: 1.75rem;
  }

  .site-logo,
  .site-logo-placeholder {
    width: 160px;
    height: 160px;
    font-size: 5rem;
  }

  .lead {
    font-size: 1rem;
  }
}

.church-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.church-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.church-logo {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.church-icon {
  font-size: 4rem;
  text-align: center;
  margin-bottom: 1rem;
}

.church-description {
  color: var(--gray-600);
  min-height: 3rem;
}

.church-info {
  margin: 1rem 0;
  font-size: 0.875rem;
}

.info-item {
  margin-bottom: 0.5rem;
  color: var(--gray-700);
}
</style>
