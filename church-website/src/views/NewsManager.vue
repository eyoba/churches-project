<template>
  <div class="news-manager">
    <div class="page-header">
      <h1>Manage News</h1>
      <button class="btn btn-primary" @click="showCreateForm">
        + Create News Article
      </button>
    </div>

    <div v-if="loading && news.length === 0" class="spinner"></div>

    <div v-else-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <div v-else>
      <div v-if="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>

      <!-- Create/Edit Form -->
      <div v-if="showForm" class="card mb-4">
        <h2>{{ editingNews ? 'Edit News Article' : 'Create News Article' }}</h2>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="title">Title *</label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              placeholder="Enter news title"
              required
              :disabled="saving"
            >
          </div>

          <div class="form-group">
            <label for="content">Content *</label>
            <textarea
              id="content"
              v-model="formData.content"
              placeholder="Enter news content"
              rows="8"
              required
              :disabled="saving"
            ></textarea>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="saving"
            >
              <span v-if="saving">{{ editingNews ? 'Updating...' : 'Creating...' }}</span>
              <span v-else>{{ editingNews ? 'Update News' : 'Create News' }}</span>
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

      <!-- News List -->
      <div class="card">
        <h2 class="mb-3">All News Articles</h2>

        <div v-if="news.length === 0" class="text-center p-4">
          <p>No news articles yet. Create your first one above!</p>
        </div>

        <div v-else class="news-list">
          <div v-for="item in news" :key="item.id" class="news-item">
            <div class="news-item-content">
              <h3>{{ item.title }}</h3>
              <p class="news-excerpt">{{ truncateText(item.content, 150) }}</p>
              <p class="news-date">{{ formatDate(item.created_at) }}</p>
            </div>

            <div class="news-item-actions">
              <button
                class="btn btn-secondary btn-sm"
                @click="editNews(item)"
                :disabled="deleting === item.id"
              >
                Edit
              </button>
              <button
                class="btn btn-danger btn-sm"
                @click="deleteNews(item.id)"
                :disabled="deleting === item.id"
              >
                <span v-if="deleting === item.id">Deleting...</span>
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
  name: 'NewsManager',
  data() {
    return {
      news: [],
      showForm: false,
      editingNews: null,
      formData: {
        title: '',
        content: ''
      },
      loading: true,
      saving: false,
      deleting: null,
      error: null,
      successMessage: null
    }
  },
  async mounted() {
    await this.fetchNews()
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
    async fetchNews() {
      try {
        this.loading = true
        this.error = null

        const headers = this.getAuthHeaders()
        if (!headers) return

        const response = await axios.get(`${API_URL}/church-admin/news`, {
          headers
        })

        this.news = response.data
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('church_admin_token')
          localStorage.removeItem('church_admin_user')
          this.$router.push('/admin/login')
        } else {
          this.error = err.response?.data?.error || 'Failed to load news'
        }
        console.error('Error fetching news:', err)
      } finally {
        this.loading = false
      }
    },
    showCreateForm() {
      this.showForm = true
      this.editingNews = null
      this.formData = {
        title: '',
        content: ''
      }
      this.error = null
      this.successMessage = null
    },
    editNews(item) {
      this.showForm = true
      this.editingNews = item
      this.formData = {
        title: item.title,
        content: item.content
      }
      this.error = null
      this.successMessage = null
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    cancelForm() {
      this.showForm = false
      this.editingNews = null
      this.formData = {
        title: '',
        content: ''
      }
      this.error = null
    },
    async handleSubmit() {
      if (!this.formData.title.trim() || !this.formData.content.trim()) {
        this.error = 'Please fill in all required fields'
        return
      }

      try {
        this.saving = true
        this.error = null
        this.successMessage = null

        const headers = this.getAuthHeaders()
        if (!headers) return

        if (this.editingNews) {
          // Update existing news
          await axios.put(
            `${API_URL}/church-admin/news/${this.editingNews.id}`,
            this.formData,
            { headers }
          )
          this.successMessage = 'News article updated successfully!'
        } else {
          // Create new news
          await axios.post(
            `${API_URL}/church-admin/news`,
            this.formData,
            { headers }
          )
          this.successMessage = 'News article created successfully!'
        }

        this.showForm = false
        this.editingNews = null
        this.formData = {
          title: '',
          content: ''
        }

        await this.fetchNews()

        setTimeout(() => {
          this.successMessage = null
        }, 5000)
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('church_admin_token')
          localStorage.removeItem('church_admin_user')
          this.$router.push('/admin/login')
        } else {
          this.error = err.response?.data?.error || 'Failed to save news article'
        }
        console.error('Error saving news:', err)
      } finally {
        this.saving = false
      }
    },
    async deleteNews(id) {
      if (!confirm('Are you sure you want to delete this news article? This action cannot be undone.')) {
        return
      }

      try {
        this.deleting = id
        this.error = null
        this.successMessage = null

        const headers = this.getAuthHeaders()
        if (!headers) return

        await axios.delete(`${API_URL}/church-admin/news/${id}`, {
          headers
        })

        this.successMessage = 'News article deleted successfully!'
        await this.fetchNews()

        setTimeout(() => {
          this.successMessage = null
        }, 5000)
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('church_admin_token')
          localStorage.removeItem('church_admin_user')
          this.$router.push('/admin/login')
        } else {
          this.error = err.response?.data?.error || 'Failed to delete news article'
        }
        console.error('Error deleting news:', err)
      } finally {
        this.deleting = null
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

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.news-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1.5rem;
  border: 1px solid var(--gray-200);
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.news-item:hover {
  background-color: var(--gray-50);
}

.news-item-content {
  flex: 1;
}

.news-item-content h3 {
  margin: 0 0 0.5rem 0;
  color: var(--gray-900);
}

.news-excerpt {
  color: var(--gray-600);
  margin: 0.5rem 0;
  line-height: 1.6;
}

.news-date {
  color: var(--gray-500);
  font-size: 0.875rem;
  margin: 0.5rem 0 0 0;
}

.news-item-actions {
  display: flex;
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

  .news-item {
    flex-direction: column;
  }

  .news-item-actions {
    width: 100%;
  }

  .news-item-actions button {
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
