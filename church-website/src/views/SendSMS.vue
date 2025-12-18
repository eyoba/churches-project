<template>
  <div class="send-sms">
    <div class="page-header">
      <h1>Send SMS til medlemmer</h1>
      <div class="header-actions">
        <router-link to="/members/dashboard" class="btn btn-secondary">Tilbake</router-link>
        <router-link to="/members/sms-logs" class="btn btn-secondary">Se historikk</router-link>
      </div>
    </div>

    <div v-if="isLoadingMembers" class="loading">Laster medlemmer...</div>

    <div v-else class="sms-container">
      <div class="recipients-section">
        <h3>Velg mottakere</h3>

        <div class="filter-options">
          <button
            @click="selectAll"
            class="btn btn-sm btn-secondary"
            :disabled="isSending"
          >
            Velg alle
          </button>
          <button
            @click="deselectAll"
            class="btn btn-sm btn-secondary"
            :disabled="isSending"
          >
            Fjern alle
          </button>
          <div class="selected-count">
            <strong>{{ selectedMembers.length }}</strong> av {{ eligibleMembers.length }} valgt
          </div>
        </div>

        <div class="search-box">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Søk etter navn eller telefon..."
            class="search-input"
          />
        </div>

        <div class="members-list">
          <div
            v-for="member in filteredMembers"
            :key="member.id"
            class="member-item"
          >
            <label>
              <input
                type="checkbox"
                :value="member.id"
                v-model="selectedMembers"
                :disabled="isSending"
              />
              <div class="member-info">
                <div class="member-name">{{ member.full_name || member.name }}</div>
                <div class="member-phone">{{ member.phone_number || member.phone }}</div>
              </div>
            </label>
          </div>

          <div v-if="filteredMembers.length === 0" class="no-members">
            Ingen medlemmer med SMS-samtykke funnet
          </div>
        </div>
      </div>

      <div class="message-section">
        <h3>SMS-melding</h3>

        <div class="form-group">
          <label for="message">Meldingstekst</label>
          <textarea
            id="message"
            v-model="message"
            rows="6"
            maxlength="160"
            placeholder="Skriv din melding her..."
            :disabled="isSending"
            @input="updateCharCount"
          ></textarea>
          <div class="char-count">
            {{ message.length }} / 160 tegn
            <span v-if="message.length > 160" class="warning">(for lang)</span>
          </div>
        </div>

        <div class="cost-estimate">
          <h4>Kostnadsestimat</h4>
          <div class="cost-details">
            <div class="cost-line">
              <span>Antall mottakere:</span>
              <strong>{{ selectedMembers.length }}</strong>
            </div>
            <div class="cost-line">
              <span>Kostnad per SMS:</span>
              <strong>~0.45 NOK</strong>
            </div>
            <div class="cost-line total">
              <span>Total kostnad:</span>
              <strong>~{{ estimatedCost }} NOK</strong>
            </div>
          </div>
        </div>

        <div v-if="errorMessage" class="alert alert-error">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="alert alert-success">
          {{ successMessage }}
        </div>

        <button
          @click="sendSMS"
          class="btn btn-primary btn-block"
          :disabled="!canSend"
        >
          {{ isSending ? 'Sender...' : `Send SMS til ${selectedMembers.length} mottakere` }}
        </button>

        <div class="warning-note">
          <strong>OBS:</strong> SMS sendes umiddelbart. Kontroller mottakere og melding før sending.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import membersService from '../services/membersService'

export default {
  name: 'SendSMS',
  data() {
    return {
      members: [],
      selectedMembers: [],
      message: '',
      searchQuery: '',
      isLoadingMembers: true,
      isSending: false,
      errorMessage: '',
      successMessage: ''
    }
  },
  computed: {
    eligibleMembers() {
      return this.members.filter(m => m.sms_consent && m.is_active)
    },
    filteredMembers() {
      const query = this.searchQuery.toLowerCase()
      return this.eligibleMembers.filter(m => {
        const name = m.full_name || m.name || ''
        const phone = m.phone_number || m.phone || ''
        return name.toLowerCase().includes(query) || phone.includes(query)
      })
    },
    estimatedCost() {
      return (this.selectedMembers.length * 0.45).toFixed(2)
    },
    canSend() {
      return (
        this.selectedMembers.length > 0 &&
        this.message.trim().length > 0 &&
        this.message.length <= 160 &&
        !this.isSending
      )
    }
  },
  async mounted() {
    await this.loadMembers()
  },
  methods: {
    async loadMembers() {
      try {
        this.members = await membersService.getMembers({ active: true })
      } catch (error) {
        console.error('Error loading members:', error)
        this.errorMessage = 'Kunne ikke laste medlemmer'
      } finally {
        this.isLoadingMembers = false
      }
    },

    selectAll() {
      this.selectedMembers = this.filteredMembers.map(m => m.id)
    },

    deselectAll() {
      this.selectedMembers = []
    },

    updateCharCount() {
      // Just for triggering reactivity
    },

    async sendSMS() {
      if (!this.canSend) return

      const confirmed = confirm(
        `Er du sikker på at du vil sende SMS til ${this.selectedMembers.length} mottakere?\n\nEstimert kostnad: ~${this.estimatedCost} NOK`
      )

      if (!confirmed) return

      this.isSending = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        const result = await membersService.sendSMS({
          member_ids: this.selectedMembers,
          message: this.message.trim()
        })

        this.successMessage = `SMS sendt til ${result.sent || this.selectedMembers.length} mottakere!`
        this.message = ''
        this.selectedMembers = []

        setTimeout(() => {
          this.$router.push('/members/sms-logs')
        }, 2000)
      } catch (error) {
        console.error('Error sending SMS:', error)
        this.errorMessage = error.response?.data?.error || 'Kunne ikke sende SMS. Prøv igjen.'
      } finally {
        this.isSending = false
      }
    }
  }
}
</script>

<style scoped>
.send-sms {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
  color: var(--gray-900);
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--gray-600);
}

.sms-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.recipients-section {
  grid-column: 1;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  padding: 1.5rem;
}

.message-section {
  grid-column: 2;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  padding: 1.5rem;
}

.recipients-section h3,
.message-section h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--gray-900);
}

.filter-options {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.selected-count {
  margin-left: auto;
  color: var(--gray-700);
}

.search-box {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  font-size: 1rem;
}

.members-list {
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid var(--gray-200);
  border-radius: 4px;
}

.member-item {
  border-bottom: 1px solid var(--gray-100);
}

.member-item:last-child {
  border-bottom: none;
}

.member-item label {
  display: flex;
  align-items: center;
  padding: 1rem;
  margin-right: 16rem;
  cursor: pointer;
  transition: background 0.2s;
}

.member-item label:hover {
  background: var(--gray-50);
}

.member-item input[type="checkbox"] {
  margin-right: 1rem;
}

.member-info {
  flex: 1;
}

.member-name {
  font-weight: 500;
  color: var(--gray-900);
  margin-bottom: 0.25rem;
}

.member-phone {
  font-size: 0.9rem;
  color: var(--gray-600);
}

.no-members {
  padding: 2rem;
  text-align: center;
  color: var(--gray-600);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--gray-700);
}

.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
}

.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.char-count {
  text-align: right;
  font-size: 0.85rem;
  color: var(--gray-600);
  margin-top: 0.25rem;
}

.char-count .warning {
  color: #c33;
  font-weight: bold;
}

.cost-estimate {
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.cost-estimate h4 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  color: var(--gray-800);
  font-size: 1rem;
}

.cost-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: var(--gray-700);
}

.cost-line.total {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--gray-300);
  font-size: 1.1rem;
}

.alert-error {
  background-color: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.alert-success {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.btn-block {
  width: 100%;
  margin-bottom: 1rem;
}

.warning-note {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

@media (max-width: 992px) {
  .send-sms {
    padding: 1rem;
  }

  .sms-container {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .header-actions {
    flex-wrap: wrap;
  }

  .member-item label {
    margin-right: 0;
  }
}
</style>
