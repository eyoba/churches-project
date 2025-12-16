<template>
  <div class="public-layout">
    <nav>
      <div class="container">
        <router-link to="/" class="logo">
          <h2>{{ navTitle || 'Churches Directory' }}</h2>
        </router-link>
        <div class="nav-links">
          <router-link to="/">Home</router-link>
          <router-link to="/admin/login" class="btn btn-primary btn-sm">Admin Login</router-link>
        </div>
      </div>
    </nav>

    <main>
      <router-view />
    </main>

    <footer>
      <div class="container text-center">
        <p>&copy; 2026 Eritrean Orthodox Tewahdo Church, Diocese of Norway. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export default {
  name: 'PublicLayout',
  data() {
    return {
      navTitle: ''
    }
  },
  async mounted() {
    await this.fetchSiteSettings()
  },
  methods: {
    async fetchSiteSettings() {
      try {
        const response = await axios.get(`${API_URL}/site-settings`)
        this.navTitle = response.data.nav_title || ''
      } catch (err) {
        console.error('Error fetching site settings:', err)
      }
    }
  }
}
</script>

<style scoped>
.public-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

nav .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  text-decoration: none;
  color: var(--gray-900);
}

.logo h2 {
  margin: 0;
  line-height: 1.3;
  font-size: 1.25rem;
}

.logo h2 br {
  display: block;
  content: "";
  margin-top: 0.25rem;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

main {
  flex: 1;
}

footer {
  background: var(--gray-100);
  padding: 2rem 0;
  margin-top: 4rem;
}

@media (max-width: 768px) {
  nav .container {
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
