<template>
  <div class="admin-management">
    <div class="header">
      <h1>Admin Management</h1>
      <div class="header-actions">
        <button @click="goBack" class="btn-secondary">
          <span class="icon">←</span> Tilbake
        </button>
        <button @click="openAddModal" class="btn-primary">
          <span class="icon">+</span> Add New Admin
        </button>
      </div>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>
    <div v-if="success" class="alert alert-success">{{ success }}</div>

    <div class="admins-table">
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Full Name</th>
            <th>Email</th>
            <th>Super Admin</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="admin in admins" :key="admin.id">
            <td>{{ admin.username }}</td>
            <td>{{ admin.full_name }}</td>
            <td>{{ admin.email || '-' }}</td>
            <td>
              <span :class="admin.is_super_admin ? 'badge-success' : 'badge-default'">
                {{ admin.is_super_admin ? 'Yes' : 'No' }}
              </span>
            </td>
            <td>
              <span :class="admin.is_active ? 'badge-success' : 'badge-danger'">
                {{ admin.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="actions">
              <button @click="openEditModal(admin)" class="btn-edit" title="Edit">
                ✏️
              </button>
              <button @click="confirmDelete(admin)" class="btn-delete" title="Delete">
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ isEditing ? 'Edit Admin' : 'Add New Admin' }}</h2>
          <button @click="closeModal" class="btn-close">&times;</button>
        </div>

        <form @submit.prevent="saveAdmin">
          <div class="form-group">
            <label for="username">Username *</label>
            <input
              id="username"
              v-model="formData.username"
              type="text"
              required
              :disabled="isEditing"
              placeholder="Enter username"
            />
          </div>

          <div class="form-group">
            <label for="password">Password {{ isEditing ? '' : '*' }}</label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              :required="!isEditing"
              :placeholder="isEditing ? 'Leave blank to keep current password' : 'Enter password'"
            />
          </div>

          <div class="form-group">
            <label for="full_name">Full Name *</label>
            <input
              id="full_name"
              v-model="formData.full_name"
              type="text"
              required
              placeholder="Enter full name"
            />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="Enter email address"
            />
          </div>

          <div class="form-group checkbox-group">
            <label>
              <input
                v-model="formData.is_super_admin"
                type="checkbox"
              />
              <span>Super Admin</span>
            </label>
          </div>

          <div class="form-group checkbox-group">
            <label>
              <input
                v-model="formData.is_active"
                type="checkbox"
              />
              <span>Active</span>
            </label>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn-primary">
              {{ isEditing ? 'Update Admin' : 'Create Admin' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content delete-modal" @click.stop>
        <div class="modal-header">
          <h2>Confirm Delete</h2>
          <button @click="showDeleteModal = false" class="btn-close">&times;</button>
        </div>

        <p>Are you sure you want to delete admin <strong>{{ adminToDelete?.username }}</strong>?</p>
        <p class="warning">This action cannot be undone.</p>

        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn-secondary">
            Cancel
          </button>
          <button @click="deleteAdmin" class="btn-danger">
            Delete Admin
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import membersService from '../services/membersService'

export default {
  name: 'AdminManagement',
  setup() {
    const router = useRouter()
    const admins = ref([])
    const showModal = ref(false)
    const showDeleteModal = ref(false)
    const isEditing = ref(false)
    const error = ref('')
    const success = ref('')
    const adminToDelete = ref(null)

    const formData = ref({
      username: '',
      password: '',
      full_name: '',
      email: '',
      is_super_admin: false,
      is_active: true
    })

    const loadAdmins = async () => {
      try {
        error.value = ''
        admins.value = await membersService.getAdmins()
      } catch (err) {
        error.value = err.response?.data?.error || 'Failed to load admins'
      }
    }

    const openAddModal = () => {
      isEditing.value = false
      formData.value = {
        username: '',
        password: '',
        full_name: '',
        email: '',
        is_super_admin: false,
        is_active: true
      }
      showModal.value = true
    }

    const openEditModal = (admin) => {
      isEditing.value = true
      formData.value = {
        id: admin.id,
        username: admin.username,
        password: '',
        full_name: admin.full_name,
        email: admin.email || '',
        is_super_admin: admin.is_super_admin,
        is_active: admin.is_active
      }
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      error.value = ''
      success.value = ''
    }

    const saveAdmin = async () => {
      try {
        error.value = ''
        success.value = ''

        if (isEditing.value) {
          await membersService.updateAdmin(formData.value.id, formData.value)
          success.value = 'Admin updated successfully'
        } else {
          await membersService.createAdmin(formData.value)
          success.value = 'Admin created successfully'
        }

        closeModal()
        await loadAdmins()

        setTimeout(() => {
          success.value = ''
        }, 3000)
      } catch (err) {
        error.value = err.response?.data?.error || 'Failed to save admin'
      }
    }

    const confirmDelete = (admin) => {
      adminToDelete.value = admin
      showDeleteModal.value = true
    }

    const deleteAdmin = async () => {
      try {
        error.value = ''
        success.value = ''

        await membersService.deleteAdmin(adminToDelete.value.id)
        success.value = 'Admin deleted successfully'

        showDeleteModal.value = false
        adminToDelete.value = null
        await loadAdmins()

        setTimeout(() => {
          success.value = ''
        }, 3000)
      } catch (err) {
        error.value = err.response?.data?.error || 'Failed to delete admin'
        showDeleteModal.value = false
      }
    }

    const goBack = () => {
      router.push('/members/dashboard')
    }

    onMounted(() => {
      loadAdmins()
    })

    return {
      admins,
      showModal,
      showDeleteModal,
      isEditing,
      error,
      success,
      formData,
      adminToDelete,
      openAddModal,
      openEditModal,
      closeModal,
      saveAdmin,
      confirmDelete,
      deleteAdmin,
      goBack
    }
  }
}
</script>

<style scoped>
.admin-management {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  margin: 0;
  color: #2c3e50;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.alert-error {
  background-color: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

.alert-success {
  background-color: #efe;
  color: #3a3;
  border: 1px solid #cfc;
}

.admins-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: #f8f9fa;
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

tbody tr:hover {
  background-color: #f8f9fa;
}

.badge-success {
  background-color: #28a745;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
}

.badge-danger {
  background-color: #dc3545;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
}

.badge-default {
  background-color: #6c757d;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-primary {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-edit {
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.25rem;
}

.btn-edit:hover {
  transform: scale(1.2);
}

.btn-delete {
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.25rem;
}

.btn-delete:hover {
  transform: scale(1.2);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  min-width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.delete-modal {
  min-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #6c757d;
  line-height: 1;
}

.btn-close:hover {
  color: #2c3e50;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #495057;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  width: 1.25rem;
  height: 1.25rem;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.warning {
  color: #dc3545;
  font-weight: 600;
}

.icon {
  font-size: 1.25rem;
  font-weight: bold;
}
</style>
