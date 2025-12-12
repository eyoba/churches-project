<template>
  <div class="home">
    <div class="hero">
      <div class="container text-center">
        <h1>Welcome to Churches Directory</h1>
        <p class="lead">Find and connect with churches in your community</p>
      </div>
    </div>

    <div class="container">
      <div v-if="loading" class="spinner"></div>

      <div v-else-if="error" class="alert alert-error">
        {{ error }}
      </div>

      <div v-else>
        <h2 class="mb-3">Our Churches</h2>
        <div class="grid grid-2">
          <div v-for="church in churches" :key="church.id" class="card church-card">
            <img v-if="church.logo_url" :src="church.logo_url" :alt="church.name" class="church-logo">
            <div class="church-icon" v-else>⛪</div>

            <h3>{{ church.name }}</h3>
            <p class="church-description">{{ church.description || 'No description available' }}</p>

            <div class="church-info">
              <div v-if="church.pastor_name" class="info-item">
                <strong>Pastor:</strong> {{ church.pastor_name }}
              </div>
              <div v-if="church.address" class="info-item">
                <strong>Address:</strong> {{ church.address }}
              </div>
              <div v-if="church.phone" class="info-item">
                <strong>Phone:</strong> {{ church.phone }}
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
      error: null
    }
  },
  async mounted() {
    await this.fetchChurches()
  },
  methods: {
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
    }
  }
}
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 4rem 0;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.lead {
  font-size: 1.25rem;
  opacity: 0.9;
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

@media (max-width: 768px) {
  .hero h1 {
    font-size: 2rem;
  }

  .lead {
    font-size: 1rem;
  }
}
</style>
