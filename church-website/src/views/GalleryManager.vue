<template>
  <div class="gallery-manager">
    <div class="page-header">
      <h1>Manage Gallery</h1>
      <button class="btn btn-primary" @click="showUploadForm">
        + Upload Photo
      </button>
    </div>

    <div v-if="loading && photos.length === 0" class="spinner"></div>

    <div v-else-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <div v-else>
      <div v-if="successMessage" class="alert alert-success">
        {{ successMessage }}
      </div>

      <!-- Upload Form -->
      <div v-if="showForm" class="card mb-4">
        <h2>Upload Photo</h2>

        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="photo_url">Photo URL *</label>
            <input
              id="photo_url"
              v-model="formData.photo_url"
              type="url"
              placeholder="https://example.com/photo.jpg"
              required
              :disabled="saving"
            >
            <small class="form-help">
              Enter the direct URL to the image. Supported formats: JPG, PNG, GIF, WebP
            </small>
          </div>

          <div class="form-group">
            <label for="caption">Caption</label>
            <input
              id="caption"
              v-model="formData.caption"
              type="text"
              placeholder="Optional caption for the photo"
              :disabled="saving"
            >
          </div>

          <div v-if="formData.photo_url" class="photo-preview">
            <label>Preview:</label>
            <img
              :src="formData.photo_url"
              alt="Photo preview"
              @error="handleImageError"
            >
            <p v-if="imageError" class="preview-error">
              Unable to load image. Please check the URL.
            </p>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="saving || imageError"
            >
              <span v-if="saving">Uploading...</span>
              <span v-else>Upload Photo</span>
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

        <div class="upload-tips card mt-3" style="background-color: var(--gray-50);">
          <h3>Tips for uploading photos:</h3>
          <ul>
            <li>Use high-quality images for best results</li>
            <li>Recommended size: 1200x800 pixels or larger</li>
            <li>You can use free image hosting services like Imgur, Cloudinary, or ImageKit</li>
            <li>Make sure the URL points directly to the image file (ends with .jpg, .png, etc.)</li>
            <li>Add descriptive captions to help visitors understand the context</li>
          </ul>
        </div>
      </div>

      <!-- Photos Grid -->
      <div class="card">
        <h2 class="mb-3">All Photos ({{ photos.length }})</h2>

        <div v-if="photos.length === 0" class="text-center p-4">
          <p>No photos yet. Upload your first one above!</p>
        </div>

        <div v-else class="photos-grid">
          <div v-for="photo in photos" :key="photo.id" class="photo-card">
            <div class="photo-image" @click="viewPhoto(photo)">
              <img :src="photo.photo_url" :alt="photo.caption || 'Church photo'">
            </div>

            <div class="photo-info">
              <p v-if="photo.caption" class="photo-caption">{{ photo.caption }}</p>
              <p v-else class="photo-caption-empty">No caption</p>
              <p class="photo-date">Uploaded {{ formatDate(photo.created_at) }}</p>
            </div>

            <div class="photo-actions">
              <button
                class="btn btn-danger btn-sm"
                @click="deletePhoto(photo.id)"
                :disabled="deleting === photo.id"
              >
                <span v-if="deleting === photo.id">Deleting...</span>
                <span v-else>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Photo Viewer Modal -->
    <div v-if="selectedPhoto" class="photo-modal" @click="closePhotoViewer">
      <div class="photo-modal-content">
        <button class="photo-modal-close" @click.stop="closePhotoViewer">&times;</button>
        <img :src="selectedPhoto.photo_url" :alt="selectedPhoto.caption || 'Church photo'">
        <p v-if="selectedPhoto.caption" class="photo-modal-caption">{{ selectedPhoto.caption }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL

export default {
  name: 'GalleryManager',
  data() {
    return {
      photos: [],
      showForm: false,
      formData: {
        photo_url: '',
        caption: ''
      },
      selectedPhoto: null,
      loading: true,
      saving: false,
      deleting: null,
      error: null,
      successMessage: null,
      imageError: false
    }
  },
  async mounted() {
    await this.fetchPhotos()
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
    async fetchPhotos() {
      try {
        this.loading = true
        this.error = null

        const headers = this.getAuthHeaders()
        if (!headers) return

        const response = await axios.get(`${API_URL}/church-admin/photos`, {
          headers
        })

        this.photos = response.data
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('church_admin_token')
          localStorage.removeItem('church_admin_user')
          this.$router.push('/admin/login')
        } else {
          this.error = err.response?.data?.error || 'Failed to load photos'
        }
        console.error('Error fetching photos:', err)
      } finally {
        this.loading = false
      }
    },
    showUploadForm() {
      this.showForm = true
      this.formData = {
        photo_url: '',
        caption: ''
      }
      this.imageError = false
      this.error = null
      this.successMessage = null
    },
    cancelForm() {
      this.showForm = false
      this.formData = {
        photo_url: '',
        caption: ''
      }
      this.imageError = false
      this.error = null
    },
    async handleSubmit() {
      if (!this.formData.photo_url.trim()) {
        this.error = 'Please enter a photo URL'
        return
      }

      if (this.imageError) {
        this.error = 'Please provide a valid image URL'
        return
      }

      try {
        this.saving = true
        this.error = null
        this.successMessage = null

        const headers = this.getAuthHeaders()
        if (!headers) return

        const photoData = {
          photo_url: this.formData.photo_url,
          caption: this.formData.caption || null
        }

        await axios.post(
          `${API_URL}/church-admin/photos`,
          photoData,
          { headers }
        )

        this.successMessage = 'Photo uploaded successfully!'
        this.showForm = false
        this.formData = {
          photo_url: '',
          caption: ''
        }
        this.imageError = false

        await this.fetchPhotos()

        setTimeout(() => {
          this.successMessage = null
        }, 5000)
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('church_admin_token')
          localStorage.removeItem('church_admin_user')
          this.$router.push('/admin/login')
        } else {
          this.error = err.response?.data?.error || 'Failed to upload photo'
        }
        console.error('Error uploading photo:', err)
      } finally {
        this.saving = false
      }
    },
    async deletePhoto(id) {
      if (!confirm('Are you sure you want to delete this photo? This action cannot be undone.')) {
        return
      }

      try {
        this.deleting = id
        this.error = null
        this.successMessage = null

        const headers = this.getAuthHeaders()
        if (!headers) return

        await axios.delete(`${API_URL}/church-admin/photos/${id}`, {
          headers
        })

        this.successMessage = 'Photo deleted successfully!'
        await this.fetchPhotos()

        setTimeout(() => {
          this.successMessage = null
        }, 5000)
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('church_admin_token')
          localStorage.removeItem('church_admin_user')
          this.$router.push('/admin/login')
        } else {
          this.error = err.response?.data?.error || 'Failed to delete photo'
        }
        console.error('Error deleting photo:', err)
      } finally {
        this.deleting = null
      }
    },
    viewPhoto(photo) {
      this.selectedPhoto = photo
      document.body.style.overflow = 'hidden'
    },
    closePhotoViewer() {
      this.selectedPhoto = null
      document.body.style.overflow = ''
    },
    handleImageError() {
      this.imageError = true
    },
    formatDate(dateString) {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  },
  watch: {
    'formData.photo_url'() {
      this.imageError = false
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

.form-help {
  display: block;
  margin-top: 0.5rem;
  color: var(--gray-500);
  font-size: 0.875rem;
}

.photo-preview {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--gray-50);
  border-radius: 0.5rem;
}

.photo-preview label {
  display: block;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.photo-preview img {
  max-width: 100%;
  max-height: 400px;
  border-radius: 0.5rem;
  border: 2px solid var(--gray-200);
}

.preview-error {
  color: var(--danger-color);
  margin-top: 0.5rem;
  font-size: 0.875rem;
}

.upload-tips {
  padding: 1.5rem;
}

.upload-tips h3 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.upload-tips ul {
  margin: 0;
  padding-left: 1.5rem;
}

.upload-tips li {
  margin-bottom: 0.5rem;
  color: var(--gray-700);
  font-size: 0.875rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* Photos Grid */
.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.photo-card {
  border: 1px solid var(--gray-200);
  border-radius: 0.5rem;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.photo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.photo-image {
  width: 100%;
  height: 250px;
  overflow: hidden;
  cursor: pointer;
  background: var(--gray-100);
}

.photo-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.photo-image:hover img {
  transform: scale(1.05);
}

.photo-info {
  padding: 1rem;
}

.photo-caption {
  margin: 0 0 0.5rem 0;
  color: var(--gray-900);
  font-weight: 500;
}

.photo-caption-empty {
  margin: 0 0 0.5rem 0;
  color: var(--gray-400);
  font-style: italic;
  font-size: 0.875rem;
}

.photo-date {
  margin: 0;
  color: var(--gray-500);
  font-size: 0.875rem;
}

.photo-actions {
  padding: 0 1rem 1rem 1rem;
}

.photo-actions button {
  width: 100%;
}

/* Photo Modal */
.photo-modal {
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

.photo-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.photo-modal-content img {
  max-width: 100%;
  max-height: 85vh;
  border-radius: 0.5rem;
}

.photo-modal-close {
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

.photo-modal-caption {
  color: white;
  text-align: center;
  margin-top: 1rem;
  font-size: 1rem;
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

  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }

  .photo-image {
    height: 200px;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
