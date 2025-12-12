<template>
  <div class="events-manager">
    <div class="page-header">
      <h1>Manage Events</h1>
      <button class="btn btn-primary" @click="showCreateForm">
        + Create Event
      </button>
    </div>

    <div v-if="loading && events.length === 0" class="spinner"></div>

    <div v-else-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <div v-else>
      <div v-if="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>

      <!-- Create/Edit Form -->
      <div v-if="showForm" class="card mb-4">
        <h2>{{ editingEvent ? 'Edit Event' : 'Create Event' }}</h2>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="title">Event Title *</label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              placeholder="Enter event title"
              required
              :disabled="saving"
            >
          </div>

          <div class="form-group">
            <label for="description">Description *</label>
            <textarea
              id="description"
              v-model="formData.description"
              placeholder="Enter event description"
              rows="6"
              required
              :disabled="saving"
            ></textarea>
          </div>

          <div class="form-row grid-2">
            <div class="form-group">
              <label for="event_date">Event Date *</label>
              <input
                id="event_date"
                v-model="formData.event_date"
                type="date"
                required
                :disabled="saving"
              >
            </div>

            <div class="form-group">
              <label for="event_time">Event Time</label>
              <input
                id="event_time"
                v-model="formData.event_time"
                type="time"
                :disabled="saving"
              >
              <small class="form-help">Optional - Leave blank if time is not specific</small>
            </div>
          </div>

          <div class="form-group">
            <label for="location">Location</label>
            <input
              id="location"
              v-model="formData.location"
              type="text"
              placeholder="Event location or address"
              :disabled="saving"
            >
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="formData.is_published"
                :disabled="saving"
              >
              <span>Publish immediately (visible on website)</span>
            </label>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="saving"
            >
              <span v-if="saving">{{ editingEvent ? 'Updating...' : 'Creating...' }}</span>
              <span v-else>{{ editingEvent ? 'Update Event' : 'Create Event' }}</span>
            </button>

            <button
              type="button"
              class="btn btn-secondary"
              @click="cancelForm"
              :disabled="saving"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <!-- Events List -->
      <div class="card">
        <h2 class="mb-3">All Events</h2>

        <div v-if="events.length === 0" class="text-center p-4">
          <p>No events yet. Create your first one above!</p>
        </div>

        <div v-else class="events-list">
          <div v-for="event in events" :key="event.id" class="event-item">
            <div class="event-date-badge">
              <div class="event-month">{{ formatMonth(event.event_date) }}</div>
              <div class="event-day">{{ formatDay(event.event_date) }}</div>
            </div>

            <div class="event-item-content">
              <h3>{{ event.title }}</h3>
              <p class="event-details">
                <strong>Date:</strong> {{ formatFullDate(event.event_date) }}
                <span v-if="event.event_time"> at {{ formatTime(event.event_time) }}</span>
              </p>
              <p v-if="event.location" class="event-location">
                <strong>Location:</strong> {{ event.location }}
              </p>
              <p class="event-description">{{ truncateText(event.description, 150) }}</p>
            </div>

            <div class="event-item-actions">
              <button
                class="btn btn-secondary btn-sm"
                @click="editEvent(event)"
                :disabled="deleting === event.id"
              >
                Edit
              </button>
              <button
                class="btn btn-danger btn-sm"
                @click="deleteEvent(event.id)"
                :disabled="deleting === event.id"
              >
                <span v-if="deleting === event.id">Deleting...</span>
                <span v-else>Delete</span>
              </button>
            </div>
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
  name: 'EventsManager',
  data() {
    return {
      events: [],
      showForm: false,
      editingEvent: null,
      formData: {
        title: '',
        description: '',
        event_date: '',
        event_time: '',
        location: '',
        is_published: true
      },
      loading: true,
      saving: false,
      deleting: null,
      error: null,
      successMessage: null
    }
  },
  async mounted() {
    await this.fetchEvents()
  },
  methods: {
    getAuthHeaders() {
      const token = localStorage.getItem('church_admin_token')
      if (!token) {
        this.$router.push('/admin/login')
        return null
      }
      return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    },
    async fetchEvents() {
      try {
        this.loading = true
        this.error = null

        const headers = this.getAuthHeaders()
        if (!headers) return

        const response = await axios.get(`${API_URL}/church-admin/events`, {
          headers
        })

        this.events = response.data
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('church_admin_token')
          localStorage.removeItem('church_admin_user')
          this.$router.push('/admin/login')
        } else {
          this.error = err.response?.data?.error || 'Failed to load events'
        }
        console.error('Error fetching events:', err)
      } finally {
        this.loading = false
      }
    },
    showCreateForm() {
      this.showForm = true
      this.editingEvent = null
      this.formData = {
        title: '',
        description: '',
        event_date: '',
        event_time: '',
        location: '',
        is_published: true
      }
      this.error = null
      this.successMessage = null
    },
    editEvent(event) {
      this.showForm = true
      this.editingEvent = event
      this.formData = {
        title: event.title,
        description: event.description,
        event_date: event.event_date.split('T')[0], // Convert to YYYY-MM-DD format
        event_time: event.event_time || '',
        location: event.location || '',
        is_published: event.is_published !== false
      }
      this.error = null
      this.successMessage = null
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    cancelForm() {
      this.showForm = false
      this.editingEvent = null
      this.formData = {
        title: '',
        description: '',
        event_date: '',
        event_time: '',
        location: '',
        is_published: true
      }
      this.error = null
    },
    async handleSubmit() {
      if (!this.formData.title.trim() || !this.formData.description.trim() || !this.formData.event_date) {
        this.error = 'Please fill in all required fields'
        return
      }

      try {
        this.saving = true
        this.error = null
        this.successMessage = null

        const headers = this.getAuthHeaders()
        if (!headers) return

        // Prepare data
        const eventData = {
          title: this.formData.title,
          description: this.formData.description,
          event_date: this.formData.event_date,
          event_time: this.formData.event_time || null,
          location: this.formData.location || null,
          is_published: this.formData.is_published
        }

        if (this.editingEvent) {
          // Update existing event
          await axios.put(
            `${API_URL}/church-admin/events/${this.editingEvent.id}`,
            eventData,
            { headers }
          )
          this.successMessage = 'Event updated successfully!'
        } else {
          // Create new event
          await axios.post(
            `${API_URL}/church-admin/events`,
            eventData,
            { headers }
          )
          this.successMessage = 'Event created successfully!'
        }

        this.showForm = false
        this.editingEvent = null
        this.formData = {
          title: '',
          description: '',
          event_date: '',
          event_time: '',
          location: '',
          is_published: true
        }

        await this.fetchEvents()

        setTimeout(() => {
          this.successMessage = null
        }, 5000)
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('church_admin_token')
          localStorage.removeItem('church_admin_user')
          this.$router.push('/admin/login')
        } else {
          this.error = err.response?.data?.error || 'Failed to save event'
        }
        console.error('Error saving event:', err)
      } finally {
        this.saving = false
      }
    },
    async deleteEvent(id) {
      if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
        return
      }

      try {
        this.deleting = id
        this.error = null
        this.successMessage = null

        const headers = this.getAuthHeaders()
        if (!headers) return

        await axios.delete(`${API_URL}/church-admin/events/${id}`, {
          headers
        })

        this.successMessage = 'Event deleted successfully!'
        await this.fetchEvents()

        setTimeout(() => {
          this.successMessage = null
        }, 5000)
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('church_admin_token')
          localStorage.removeItem('church_admin_user')
          this.$router.push('/admin/login')
        } else {
          this.error = err.response?.data?.error || 'Failed to delete event'
        }
        console.error('Error deleting event:', err)
      } finally {
        this.deleting = null
      }
    },
    formatMonth(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
    },
    formatDay(dateString) {
      const date = new Date(dateString)
      return date.getDate()
    },
    formatFullDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    },
    formatTime(timeString) {
      if (!timeString) return ''
      const [hours, minutes] = timeString.split(':')
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${ampm}`
    },
    truncateText(text, maxLength) {
      if (text.length <= maxLength) return text
      return text.substring(0, maxLength) + '...'
    }
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: normal;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

.checkbox-label span {
  user-select: none;
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

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-item {
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem;
  border: 1px solid var(--gray-200);
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.event-item:hover {
  background-color: var(--gray-50);
}

.event-date-badge {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.event-month {
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.event-day {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.event-item-content {
  flex: 1;
}

.event-item-content h3 {
  margin: 0 0 0.5rem 0;
  color: var(--gray-900);
}

.event-details,
.event-location {
  color: var(--gray-700);
  font-size: 0.875rem;
  margin: 0.25rem 0;
}

.event-description {
  color: var(--gray-600);
  margin: 0.75rem 0 0 0;
  line-height: 1.6;
}

.event-item-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .page-header button {
    width: 100%;
  }

  .form-row.grid-2 {
    grid-template-columns: 1fr;
  }

  .event-item {
    flex-direction: column;
  }

  .event-date-badge {
    width: 100%;
    flex-direction: row;
    gap: 0.5rem;
    padding: 1rem;
  }

  .event-month {
    font-size: 1rem;
  }

  .event-day {
    font-size: 1.5rem;
  }

  .event-item-actions {
    flex-direction: row;
    width: 100%;
  }

  .event-item-actions button {
    flex: 1;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
