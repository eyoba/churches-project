<template>
  <div class="sms-manager">
    <header class="app-header">
      <div class="header-content">
        <h1>SMS Manager</h1>
        <div class="header-actions">
          <span class="admin-name">{{ adminName }}</span>
          <button @click="handleLogout" class="btn btn-secondary btn-small">
            Logout
          </button>
        </div>
      </div>
    </header>

    <div class="container">
      <div class="main-content">
        <div v-if="successMessage" class="success-message">
          {{ successMessage }}
        </div>
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <div class="card members-card">
          <div class="card-header">
            <h2>Church Members</h2>
            <button @click="showAddMemberModal = true" class="btn btn-primary btn-small">
              + Add Member
            </button>
          </div>

          <div v-if="loadingMembers" class="loading">
            <div class="spinner"></div>
            <p>Loading members...</p>
          </div>

          <div v-else-if="members.length === 0" class="empty-state">
            <p>No members found. Add your first member to get started.</p>
          </div>

          <div v-else class="members-list">
            <div class="members-actions">
              <label class="select-all-label">
                <input
                  type="checkbox"
                  class="form-checkbox"
                  :checked="allSelected"
                  @change="toggleSelectAll"
                />
                <span>Select All ({{ selectedMembers.length }} selected)</span>
              </label>
            </div>

            <div class="members-grid">
              <div
                v-for="member in members"
                :key="member.id"
                class="member-card"
                :class="{ selected: selectedMembers.includes(member.id) }"
              >
                <label class="member-checkbox">
                  <input
                    type="checkbox"
                    class="form-checkbox"
                    :value="member.id"
                    v-model="selectedMembers"
                  />
                </label>
                <div class="member-info">
                  <h3>{{ member.name }}</h3>
                  <p>{{ member.phone }}</p>
                </div>
                <div class="member-actions">
                  <button @click="editMember(member)" class="btn-icon" title="Edit">✏️</button>
                  <button @click="confirmDeleteMember(member)" class="btn-icon btn-icon-danger" title="Delete">🗑️</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card composer-card">
          <div class="card-header">
            <h2>Compose SMS</h2>
            <span class="selected-count">{{ selectedMembers.length }} recipient(s) selected</span>
          </div>

          <form @submit.prevent="handleSendSMS">
            <div class="form-group">
              <label for="message">Message</label>
              <textarea
                id="message"
                v-model="smsMessage"
                class="form-textarea"
                placeholder="Type your message here..."
                maxlength="1600"
                required
              ></textarea>
              <div class="message-info">
                <span>{{ smsMessage.length }} / 1600 characters</span>
                <span>{{ messageCount }} SMS</span>
              </div>
            </div>

            <div class="form-group">
              <label>
                <input
                  type="checkbox"
                  v-model="scheduleForMorning"
                  class="form-checkbox"
                  style="display: inline-block; width: auto; margin-right: 0.5rem;"
                />
                Schedule for before 10:00 AM tomorrow
              </label>
            </div>

            <div class="cost-estimate">
              <strong>Estimated Cost:</strong> ${{ estimatedCost.toFixed(4) }} ({{ totalSMSCount }} SMS × $0.0075)
            </div>

            <button type="submit" class="btn btn-success" :disabled="!canSendSMS || sendingSMS" style="width: 100%;">
              {{ sendingSMS ? 'Sending...' : (scheduleForMorning ? 'Schedule SMS' : 'Send SMS Now') }}
            </button>
          </form>
        </div>

        <div class="card logs-card">
          <div class="card-header">
            <h2>SMS History</h2>
            <button @click="loadLogs" class="btn btn-secondary btn-small">Refresh</button>
          </div>

          <div v-if="loadingLogs" class="loading">
            <div class="spinner"></div>
            <p>Loading logs...</p>
          </div>

          <div v-else-if="logs.length === 0" class="empty-state">
            <p>No SMS sent yet.</p>
          </div>

          <div v-else class="logs-list">
            <div v-for="log in logs" :key="log.id" class="log-item">
              <div class="log-header">
                <span class="log-date">{{ formatDate(log.created_at) }}</span>
                <span class="log-status" :class="log.status">{{ log.status }}</span>
              </div>
              <p class="log-message">{{ log.message }}</p>
              <div class="log-footer">
                <span>Recipients: {{ log.recipients_count }}</span>
                <span>Cost: ${{ (log.recipients_count * 0.0075).toFixed(4) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAddMemberModal || editingMember" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingMember ? 'Edit Member' : 'Add New Member' }}</h2>
          <button @click="closeModal" class="modal-close">&times;</button>
        </div>
        <form @submit.prevent="saveMember">
          <div class="form-group">
            <label for="memberName">Name</label>
            <input type="text" id="memberName" v-model="memberForm.name" class="form-input" placeholder="John Doe" required />
          </div>
          <div class="form-group">
            <label for="memberPhone">Phone Number</label>
            <input type="tel" id="memberPhone" v-model="memberForm.phone" class="form-input" placeholder="+1234567890" required pattern="^\+?[1-9]\d{1,14}$" title="Please enter a valid phone number with country code" />
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="savingMember">{{ savingMember ? 'Saving...' : 'Save' }}</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="deletingMember" class="modal-overlay" @click.self="deletingMember = null">
      <div class="modal modal-small">
        <div class="modal-header">
          <h2>Confirm Delete</h2>
          <button @click="deletingMember = null" class="modal-close">&times;</button>
        </div>
        <p>Are you sure you want to delete <strong>{{ deletingMember.name }}</strong>?</p>
        <div class="modal-actions">
          <button @click="deletingMember = null" class="btn btn-secondary">Cancel</button>
          <button @click="deleteMember" class="btn btn-danger">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SMSManager',
  data() {
    return {
      adminName: '',
      members: [],
      selectedMembers: [],
      smsMessage: '',
      scheduleForMorning: false,
      logs: [],
      loadingMembers: false,
      loadingLogs: false,
      sendingSMS: false,
      savingMember: false,
      successMessage: '',
      errorMessage: '',
      showAddMemberModal: false,
      editingMember: null,
      deletingMember: null,
      memberForm: { name: '', phone: '' }
    };
  },
  computed: {
    allSelected() {
      return this.members.length > 0 && this.selectedMembers.length === this.members.length;
    },
    messageCount() {
      if (this.smsMessage.length === 0) return 0;
      if (this.smsMessage.length <= 160) return 1;
      return Math.ceil(this.smsMessage.length / 153);
    },
    totalSMSCount() {
      return this.selectedMembers.length * this.messageCount;
    },
    estimatedCost() {
      return this.totalSMSCount * 0.0075;
    },
    canSendSMS() {
      return this.selectedMembers.length > 0 && this.smsMessage.trim().length > 0;
    }
  },
  mounted() {
    this.adminName = localStorage.getItem('adminName') || 'Admin';
    this.loadMembers();
    this.loadLogs();
  },
  methods: {
    async loadMembers() {
      this.loadingMembers = true;
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const response = await axios.get(`${apiUrl}/sms/members`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.members = response.data;
      } catch (err) {
        this.showError('Failed to load members: ' + (err.response?.data?.message || err.message));
      } finally {
        this.loadingMembers = false;
      }
    },
    async loadLogs() {
      this.loadingLogs = true;
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const response = await axios.get(`${apiUrl}/sms/logs`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.logs = response.data;
      } catch (err) {
        this.showError('Failed to load logs: ' + (err.response?.data?.message || err.message));
      } finally {
        this.loadingLogs = false;
      }
    },
    toggleSelectAll() {
      if (this.allSelected) {
        this.selectedMembers = [];
      } else {
        this.selectedMembers = this.members.map(m => m.id);
      }
    },
    editMember(member) {
      this.editingMember = member;
      this.memberForm = { name: member.name, phone: member.phone };
    },
    confirmDeleteMember(member) {
      this.deletingMember = member;
    },
    async deleteMember() {
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        await axios.delete(`${apiUrl}/sms/members/${this.deletingMember.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.showSuccess('Member deleted successfully');
        this.deletingMember = null;
        this.loadMembers();
      } catch (err) {
        this.showError('Failed to delete member: ' + (err.response?.data?.message || err.message));
      }
    },
    async saveMember() {
      this.savingMember = true;
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        if (this.editingMember) {
          await axios.put(`${apiUrl}/sms/members/${this.editingMember.id}`, this.memberForm, {
            headers: { Authorization: `Bearer ${token}` }
          });
          this.showSuccess('Member updated successfully');
        } else {
          await axios.post(`${apiUrl}/sms/members`, this.memberForm, {
            headers: { Authorization: `Bearer ${token}` }
          });
          this.showSuccess('Member added successfully');
        }
        this.closeModal();
        this.loadMembers();
      } catch (err) {
        this.showError('Failed to save member: ' + (err.response?.data?.message || err.message));
      } finally {
        this.savingMember = false;
      }
    },
    closeModal() {
      this.showAddMemberModal = false;
      this.editingMember = null;
      this.memberForm = { name: '', phone: '' };
    },
    async handleSendSMS() {
      if (!this.canSendSMS) return;
      this.sendingSMS = true;
      try {
        const token = localStorage.getItem('token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        await axios.post(`${apiUrl}/sms/send`, {
          message: this.smsMessage,
          memberIds: this.selectedMembers,
          scheduleForMorning: this.scheduleForMorning
        }, { headers: { Authorization: `Bearer ${token}` } });
        this.showSuccess(this.scheduleForMorning ? 'SMS scheduled successfully' : 'SMS sent successfully');
        this.smsMessage = '';
        this.selectedMembers = [];
        this.scheduleForMorning = false;
        this.loadLogs();
      } catch (err) {
        this.showError('Failed to send SMS: ' + (err.response?.data?.message || err.message));
      } finally {
        this.sendingSMS = false;
      }
    },
    handleLogout() {
      localStorage.removeItem('token');
      localStorage.removeItem('churchId');
      localStorage.removeItem('adminName');
      this.$router.push('/login');
    },
    showSuccess(message) {
      this.successMessage = message;
      this.errorMessage = '';
      setTimeout(() => { this.successMessage = ''; }, 5000);
    },
    showError(message) {
      this.errorMessage = message;
      this.successMessage = '';
      setTimeout(() => { this.errorMessage = ''; }, 5000);
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleString();
    }
  }
};
</script>

<style scoped>
.sms-manager {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding-bottom: 2rem;
}

.app-header {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 0;
  margin-bottom: 2rem;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-name {
  color: #6b7280;
  font-weight: 500;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e5e7eb;
}

.card-header h2 {
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0;
}

.selected-count {
  color: #6b7280;
  font-size: 0.875rem;
}

.members-actions {
  margin-bottom: 1rem;
}

.select-all-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.member-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.member-card:hover {
  border-color: #2563eb;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.2);
}

.member-card.selected {
  border-color: #2563eb;
  background: #eff6ff;
}

.member-checkbox {
  flex-shrink: 0;
}

.member-info {
  flex-grow: 1;
}

.member-info h3 {
  font-size: 1rem;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.member-info p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.member-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.btn-icon:hover {
  background: #f3f4f6;
}

.btn-icon-danger:hover {
  background: #fee2e2;
}

.message-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.cost-estimate {
  background: #eff6ff;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
  color: #1e40af;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #6b7280;
}

.logs-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.log-item {
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.log-date {
  font-size: 0.875rem;
  color: #6b7280;
}

.log-status {
  font-size: 0.75rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.log-status.sent {
  background: #d1fae5;
  color: #065f46;
}

.log-status.scheduled {
  background: #fef3c7;
  color: #92400e;
}

.log-status.failed {
  background: #fee2e2;
  color: #991b1b;
}

.log-message {
  color: #374151;
  margin: 0.5rem 0;
  font-size: 0.9375rem;
}

.log-footer {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-small {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #6b7280;
  line-height: 1;
  padding: 0;
  width: 2rem;
  height: 2rem;
}

.modal-close:hover {
  color: #374151;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .members-grid {
    grid-template-columns: 1fr;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .modal {
    padding: 1.5rem;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .modal-actions button {
    width: 100%;
  }
}
</style>
