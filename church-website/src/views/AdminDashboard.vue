<template>
  <div class="admin-dashboard">
    <div class="page-header">
      <h1>Dashboard</h1>
      <p>Welcome back, {{ userName }}!</p>
    </div>

    <div v-if="loading" class="spinner"></div>

    <div v-else-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <div v-else>
      <!-- Stats Cards -->
      <div class="stats-grid grid grid-3">
        <div class="stat-card card">
          <div class="stat-icon news-icon">📰</div>
          <div class="stat-content">
            <h3>{{ stats.news || 0 }}</h3>
            <p>News Articles</p>
          </div>
        </div>

        <div class="stat-card card">
          <div class="stat-icon events-icon">📅</div>
          <div class="stat-content">
            <h3>{{ stats.upcoming_events || 0 }}</h3>
            <p>Upcoming Events</p>
          </div>
        </div>

        <div class="stat-card card">
          <div class="stat-icon photos-icon">📷</div>
          <div class="stat-content">
            <h3>{{ stats.photos || 0 }}</h3>
            <p>Gallery Photos</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions mt-4">
        <h2 class="mb-3">Quick Actions</h2>
        <div class="grid grid-2">
          <router-link to="/admin/church-info" class="action-card card">
            <div class="action-icon">⛪</div>
            <h3>Church Information</h3>
            <p>Update your church details, contact info, and description</p>
          </router-link>

          <router-link to="/admin/news" class="action-card card">
            <div class="action-icon">📰</div>
            <h3>Manage News</h3>
            <p>Create, edit, or delete news articles</p>
          </router-link>

          <router-link to="/admin/events" class="action-card card">
            <div class="action-icon">📅</div>
            <h3>Manage Events</h3>
            <p>Add upcoming events and manage existing ones</p>
          </router-link>

          <router-link to="/admin/gallery" class="action-card card">
            <div class="action-icon">📷</div>
            <h3>Manage Gallery</h3>
            <p>Upload photos and manage your church gallery</p>
          </router-link>
        </div>
      </div>

      <!-- Church Info Summary -->
      <div v-if="churchInfo" class="church-summary card mt-4">
        <h2 class="mb-3">Your Church</h2>
        <div class="church-summary-content">
          <div v-if="churchInfo.logo_url" class="church-summary-logo">
            <img :src="churchInfo.logo_url" :alt="churchInfo.name">
          </div>
          <div class="church-summary-details">
            <h3>{{ churchInfo.name }}</h3>
            <p v-if="churchInfo.description">{{ churchInfo.description }}</p>
            <div class="church-meta">
              <span v-if="churchInfo.pastor_name">Pastor: {{ churchInfo.pastor_name }}</span>
              <span v-if="churchInfo.phone">Phone: {{ churchInfo.phone }}</span>
              <span v-if="churchInfo.email">Email: {{ churchInfo.email }}</span>
            </div>
            <router-link to="/admin/church-info" class="btn btn-secondary btn-sm mt-2">
              Edit Information
            </router-link>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div v-if="recentNews.length > 0 || recentEvents.length > 0" class="recent-activity mt-4">
        <h2 class="mb-3">Recent Activity</h2>

        <div class="grid grid-2">
          <div v-if="recentNews.length > 0" class="card">
            <h3 class="mb-2">Latest News</h3>
            <div class="activity-list">
              <div v-for="item in recentNews" :key="item.id" class="activity-item">
                <strong>{{ item.title }}</strong>
                <span class="activity-date">{{ formatDate(item.created_at) }}</span>
              </div>
            </div>
            <router-link to="/admin/news" class="btn btn-secondary btn-sm mt-2">
              View All News
            </router-link>
          </div>

          <div v-if="recentEvents.length > 0" class="card">
            <h3 class="mb-2">Upcoming Events</h3>
            <div class="activity-list">
              <div v-for="event in recentEvents" :key="event.id" class="activity-item">
                <strong>{{ event.title }}</strong>
                <span class="activity-date">{{ formatDate(event.event_date) }}</span>
              </div>
            </div>
            <router-link to="/admin/events" class="btn btn-secondary btn-sm mt-2">
              View All Events
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export default {
  name: 'AdminDashboard',
  data() {
    return {
      stats: {},
      churchInfo: null,
      recentNews: [],
      recentEvents: [],
      loading: true,
      error: null
    }
  },
  computed: {
    userName() {
      const user = JSON.parse(localStorage.getItem('church_admin_user') || '{}')
      return user.church_name || 'Admin'
    }
  },
  async mounted() {
    await this.fetchDashboardData()
  },
  methods: {
    async fetchDashboardData() {
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

        this.stats = response.data.stats || {}
        this.churchInfo = response.data.church || null
        this.recentNews = response.data.recent_news || []
        this.recentEvents = response.data.recent_events || []
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('church_admin_token')
          localStorage.removeItem('church_admin_user')
          this.$router.push('/admin/login')
        } else {
          this.error = err.response?.data?.error || 'Failed to load dashboard data'
        }
        console.error('Error fetching dashboard:', err)
      } finally {
        this.loading = false
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
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
  font-size: 1.125rem;
  margin: 0;
}

/* Stats Cards */
.stats-grid {
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  font-size: 3rem;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
}

.news-icon {
  background-color: #dbeafe;
}

.events-icon {
  background-color: #fef3c7;
}

.photos-icon {
  background-color: #d1fae5;
}

.stat-content h3 {
  font-size: 2.5rem;
  margin: 0;
  color: var(--gray-900);
}

.stat-content p {
  margin: 0;
  color: var(--gray-600);
  font-size: 1rem;
}

/* Action Cards */
.action-card {
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
  cursor: pointer;
  display: block;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.action-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.action-card h3 {
  margin-bottom: 0.5rem;
  color: var(--gray-900);
}

.action-card p {
  color: var(--gray-600);
  font-size: 0.875rem;
  margin: 0;
}

/* Church Summary */
.church-summary-content {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.church-summary-logo {
  flex-shrink: 0;
}

.church-summary-logo img {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 0.5rem;
}

.church-summary-details {
  flex: 1;
}

.church-summary-details h3 {
  margin-bottom: 0.5rem;
}

.church-summary-details p {
  color: var(--gray-600);
  margin-bottom: 1rem;
}

.church-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  font-size: 0.875rem;
  color: var(--gray-700);
}

/* Recent Activity */
.activity-list {
  margin-bottom: 1rem;
}

.activity-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-item strong {
  color: var(--gray-900);
  flex: 1;
}

.activity-date {
  color: var(--gray-500);
  font-size: 0.875rem;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .stats-grid,
  .grid-2 {
    grid-template-columns: 1fr;
  }

  .stat-card {
    gap: 1rem;
  }

  .stat-icon {
    font-size: 2rem;
    width: 60px;
    height: 60px;
  }

  .stat-content h3 {
    font-size: 2rem;
  }

  .church-summary-content {
    flex-direction: column;
  }

  .church-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .activity-item {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
