<template>
  <div class="church-page">
    <div v-if="loading" class="container">
      <div class="spinner"></div>
    </div>

    <div v-else-if="error" class="container">
      <div class="alert alert-error">
        {{ error }}
      </div>
    </div>

    <div v-else class="container">
      <!-- Church Header -->
      <div class="church-header card">
        <div class="header-content">
          <div v-if="church.logo_url" class="church-logo-large">
            <img :src="church.logo_url" :alt="church.name">
          </div>
          <div class="church-icon-large" v-else>ê</div>

          <div class="church-details">
            <h1>{{ church.name }}</h1>
            <p class="church-description">{{ church.description }}</p>

            <div class="contact-info">
              <div v-if="church.pastor_name" class="contact-item">
                <strong>Pastor:</strong> {{ church.pastor_name }}
              </div>
              <div v-if="church.address" class="contact-item">
                <strong>Address:</strong> {{ church.address }}
              </div>
              <div v-if="church.phone" class="contact-item">
                <strong>Phone:</strong> {{ church.phone }}
              </div>
              <div v-if="church.email" class="contact-item">
                <strong>Email:</strong> {{ church.email }}
              </div>
              <div v-if="church.website" class="contact-item">
                <strong>Website:</strong> <a :href="church.website" target="_blank">{{ church.website }}</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button
          :class="['tab-button', { active: activeTab === 'news' }]"
          @click="activeTab = 'news'"
        >
          News
        </button>
        <button
          :class="['tab-button', { active: activeTab === 'events' }]"
          @click="activeTab = 'events'"
        >
          Events
        </button>
        <button
          :class="['tab-button', { active: activeTab === 'gallery' }]"
          @click="activeTab = 'gallery'"
        >
          Gallery
        </button>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- News Tab -->
        <div v-if="activeTab === 'news'" class="tab-panel">
          <div v-if="loadingNews" class="spinner"></div>
          <div v-else-if="news.length === 0" class="text-center p-4">
            <p>No news available at this time.</p>
          </div>
          <div v-else class="grid grid-2">
            <div v-for="item in news" :key="item.id" class="card">
              <h3>{{ item.title }}</h3>
              <p class="date">{{ formatDate(item.created_at) }}</p>
              <p>{{ item.content }}</p>
            </div>
          </div>
        </div>

        <!-- Events Tab -->
        <div v-if="activeTab === 'events'" class="tab-panel">
          <div v-if="loadingEvents" class="spinner"></div>
          <div v-else-if="events.length === 0" class="text-center p-4">
            <p>No upcoming events at this time.</p>
          </div>
          <div v-else class="grid grid-2">
            <div v-for="event in events" :key="event.id" class="card event-card">
              <h3>{{ event.title }}</h3>
              <p class="event-date">
                <strong>Date:</strong> {{ formatDate(event.event_date) }}
              </p>
              <p v-if="event.location" class="event-location">
                <strong>Location:</strong> {{ event.location }}
              </p>
              <p>{{ event.description }}</p>
            </div>
          </div>
        </div>

        <!-- Gallery Tab -->
        <div v-if="activeTab === 'gallery'" class="tab-panel">
          <div v-if="loadingPhotos" class="spinner"></div>
          <div v-else-if="photos.length === 0" class="text-center p-4">
            <p>No photos available at this time.</p>
          </div>
          <div v-else class="gallery-grid">
            <div
              v-for="photo in photos"
              :key="photo.id"
              class="gallery-item"
              @click="openLightbox(photo)"
            >
              <img :src="photo.photo_url" :alt="photo.caption || 'Church photo'">
              <div v-if="photo.caption" class="photo-caption">{{ photo.caption }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <div v-if="selectedPhoto" class="lightbox" @click="closeLightbox">
      <div class="lightbox-content">
        <button class="lightbox-close" @click.stop="closeLightbox">&times;</button>
        <img :src="selectedPhoto.photo_url" :alt="selectedPhoto.caption || 'Church photo'">
        <p v-if="selectedPhoto.caption" class="lightbox-caption">{{ selectedPhoto.caption }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export default {
  name: 'ChurchPage',
  data() {
    return {
      church: null,
      news: [],
      events: [],
      photos: [],
      activeTab: 'news',
      loading: true,
      loadingNews: false,
      loadingEvents: false,
      loadingPhotos: false,
      error: null,
      selectedPhoto: null
    }
  },
  async mounted() {
    await this.fetchChurch()
    await this.fetchNews()
  },
  watch: {
    activeTab(newTab) {
      if (newTab === 'events' && this.events.length === 0 && !this.loadingEvents) {
        this.fetchEvents()
      } else if (newTab === 'gallery' && this.photos.length === 0 && !this.loadingPhotos) {
        this.fetchPhotos()
      }
    }
  },
  methods: {
    async fetchChurch() {
      try {
        this.loading = true
        this.error = null
        const slug = this.$route.params.slug
        const response = await axios.get(`${API_URL}/churches/${slug}`)
        this.church = response.data
      } catch (err) {
        this.error = err.response?.data?.error || 'Failed to load church details'
        console.error('Error fetching church:', err)
      } finally {
        this.loading = false
      }
    },
    async fetchNews() {
      try {
        this.loadingNews = true
        const slug = this.$route.params.slug
        const response = await axios.get(`${API_URL}/churches/${slug}/news`)
        this.news = response.data
      } catch (err) {
        console.error('Error fetching news:', err)
      } finally {
        this.loadingNews = false
      }
    },
    async fetchEvents() {
      try {
        this.loadingEvents = true
        const slug = this.$route.params.slug
        const response = await axios.get(`${API_URL}/churches/${slug}/events`)
        this.events = response.data
      } catch (err) {
        console.error('Error fetching events:', err)
      } finally {
        this.loadingEvents = false
      }
    },
    async fetchPhotos() {
      try {
        this.loadingPhotos = true
        const slug = this.$route.params.slug
        const response = await axios.get(`${API_URL}/churches/${slug}/photos`)
        this.photos = response.data
      } catch (err) {
        console.error('Error fetching photos:', err)
      } finally {
        this.loadingPhotos = false
      }
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    openLightbox(photo) {
      this.selectedPhoto = photo
      document.body.style.overflow = 'hidden'
    },
    closeLightbox() {
      this.selectedPhoto = null
      document.body.style.overflow = ''
    }
  }
}
</script>

<style scoped>
.church-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.church-logo-large {
  flex-shrink: 0;
}

.church-logo-large img {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 0.75rem;
}

.church-icon-large {
  font-size: 8rem;
  text-align: center;
  width: 200px;
  flex-shrink: 0;
}

.church-details {
  flex: 1;
}

.church-description {
  color: var(--gray-600);
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
}

.contact-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.75rem;
}

.contact-item {
  color: var(--gray-700);
}

.contact-item a {
  color: var(--primary-color);
  text-decoration: none;
}

.contact-item a:hover {
  text-decoration: underline;
}

/* Tabs */
.tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 2px solid var(--gray-200);
  margin-bottom: 2rem;
}

.tab-button {
  padding: 1rem 2rem;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-size: 1rem;
  font-weight: 500;
  color: var(--gray-600);
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -2px;
}

.tab-button:hover {
  color: var(--primary-color);
}

.tab-button.active {
  color: var(--primary-color);
  border-bottom-color: var(--primary-color);
}

.tab-panel {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Date/Time Styling */
.date,
.event-date {
  color: var(--gray-500);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.event-location {
  color: var(--gray-700);
  margin-bottom: 0.5rem;
}

/* Gallery Grid */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.gallery-item {
  position: relative;
  cursor: pointer;
  border-radius: 0.5rem;
  overflow: hidden;
  aspect-ratio: 1;
  background: var(--gray-100);
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.gallery-item:hover img {
  transform: scale(1.05);
}

.photo-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 0.875rem;
  transform: translateY(100%);
  transition: transform 0.3s;
}

.gallery-item:hover .photo-caption {
  transform: translateY(0);
}

/* Lightbox */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.lightbox-content img {
  max-width: 100%;
  max-height: 85vh;
  border-radius: 0.5rem;
}

.lightbox-close {
  position: absolute;
  top: -2.5rem;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 3rem;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 3rem;
  height: 3rem;
}

.lightbox-caption {
  color: white;
  text-align: center;
  margin-top: 1rem;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .church-logo-large,
  .church-icon-large {
    margin: 0 auto;
  }

  .tabs {
    overflow-x: auto;
  }

  .tab-button {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    white-space: nowrap;
  }

  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .contact-info {
    grid-template-columns: 1fr;
  }
}
</style>
