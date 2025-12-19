<template>
  <div class="members-kontingent">
    <div class="page-header">
      <h1>Månedlig kontingent</h1>
      <router-link to="/members/dashboard" class="btn btn-secondary">Tilbake til dashboard</router-link>
    </div>

    <div class="month-selector">
      <div class="selector-group">
        <label for="month-select">Måned:</label>
        <select id="month-select" v-model="selectedMonth" @change="onMonthChange">
          <option value="01">Januar</option>
          <option value="02">Februar</option>
          <option value="03">Mars</option>
          <option value="04">April</option>
          <option value="05">Mai</option>
          <option value="06">Juni</option>
          <option value="07">Juli</option>
          <option value="08">August</option>
          <option value="09">September</option>
          <option value="10">Oktober</option>
          <option value="11">November</option>
          <option value="12">Desember</option>
        </select>
      </div>
      <div class="selector-group">
        <label for="year-select">År:</label>
        <select id="year-select" v-model="selectedYear" @change="onMonthChange">
          <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
        </select>
      </div>
      <button @click="loadKontingentData" class="btn btn-primary" :disabled="isLoading">
        {{ isLoading ? 'Laster...' : 'Vis' }}
      </button>
    </div>

    <div v-if="isLoading" class="loading">Laster kontingentdata...</div>

    <div v-else-if="errorMessage" class="alert alert-error">
      {{ errorMessage }}
    </div>

    <div v-else-if="members.length === 0" class="no-data">
      Ingen medlemmer 18+ år funnet
    </div>

    <div v-else>
      <div class="summary-card">
        <h3>Sammendrag for {{ currentMonthName }}</h3>
        <div class="summary-stats">
          <div class="summary-item">
            <span class="summary-label">Totalt medlemmer 18+:</span>
            <strong>{{ members.length }}</strong>
          </div>
          <div class="summary-item">
            <span class="summary-label">Betalt:</span>
            <strong class="text-success">{{ paidCount }}</strong>
          </div>
          <div class="summary-item">
            <span class="summary-label">Ikke betalt:</span>
            <strong class="text-danger">{{ unpaidCount }}</strong>
          </div>
        </div>
      </div>

      <div class="table-container">
        <table class="kontingent-table">
          <thead>
            <tr>
              <th>Navn</th>
              <th>Telefon</th>
              <th>Status</th>
              <th>Handling</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in members" :key="member.member_id">
              <td class="member-name">{{ member.full_name }}</td>
              <td>{{ member.phone_number || 'N/A' }}</td>
              <td>
                <span :class="['badge', member.paid ? 'badge-success' : 'badge-warning']">
                  {{ member.paid ? 'Betalt' : 'Ikke betalt' }}
                </span>
                <span v-if="member.payment_date" class="payment-date">
                  ({{ formatDate(member.payment_date) }})
                </span>
              </td>
              <td class="actions">
                <button
                  v-if="!member.paid"
                  @click="markAsPaid(member)"
                  class="btn btn-sm btn-success"
                  :disabled="updatingMemberId === member.member_id"
                >
                  {{ updatingMemberId === member.member_id ? 'Lagrer...' : 'Merk som betalt' }}
                </button>
                <button
                  v-else
                  @click="markAsUnpaid(member)"
                  class="btn btn-sm btn-warning"
                  :disabled="updatingMemberId === member.member_id"
                >
                  {{ updatingMemberId === member.member_id ? 'Lagrer...' : 'Merk som ikke betalt' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import membersService from '../services/membersService'

export default {
  name: 'MembersKontingent',
  data() {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0')

    return {
      members: [],
      selectedMonth: currentMonth,
      selectedYear: currentYear.toString(),
      isLoading: false,
      errorMessage: '',
      updatingMemberId: null
    }
  },
  computed: {
    currentMonth() {
      return `${this.selectedYear}-${this.selectedMonth}`
    },
    currentMonthName() {
      const monthNames = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
                          'Juli', 'August', 'September', 'Oktober', 'November', 'Desember']
      const monthIndex = parseInt(this.selectedMonth) - 1
      return `${monthNames[monthIndex]} ${this.selectedYear}`
    },
    availableYears() {
      const currentYear = new Date().getFullYear()
      const years = []
      // Show from 2018 to next year
      for (let year = 2018; year <= currentYear + 1; year++) {
        years.push(year.toString())
      }
      return years.reverse() // Show newest years first
    },
    paidCount() {
      return this.members.filter(m => m.paid).length
    },
    unpaidCount() {
      return this.members.filter(m => !m.paid).length
    }
  },
  async mounted() {
    await this.loadKontingentData()
  },
  methods: {
    onMonthChange() {
      // Auto-load when month or year changes
      this.loadKontingentData()
    },

    async loadKontingentData() {
      this.isLoading = true
      this.errorMessage = ''

      try {
        // Fetch all member payment data for selected month
        const data = await membersService.getKontingentForMonth(this.currentMonth)

        // Filter members 18+ based on personnummer
        this.members = data
          .map(member => {
            const age = this.calculateAge(member.personnummer)
            return { ...member, age }
          })
          .filter(member => member.age >= 18)
          .sort((a, b) => {
            const nameA = (a.full_name || '').toLowerCase()
            const nameB = (b.full_name || '').toLowerCase()
            return nameA.localeCompare(nameB, 'nb-NO')
          })

      } catch (error) {
        console.error('Error loading kontingent data:', error)
        this.errorMessage = 'Kunne ikke laste kontingentdata. Prøv igjen senere.'
      } finally {
        this.isLoading = false
      }
    },

    async markAsPaid(member) {
      this.updatingMemberId = member.member_id
      try {
        await membersService.updateKontingentPayment(
          member.member_id,
          this.currentMonth,
          true
        )
        // Reload data to show updated status
        await this.loadKontingentData()
      } catch (error) {
        console.error('Error marking as paid:', error)
        this.errorMessage = 'Kunne ikke oppdatere betalingsstatus. Prøv igjen.'
      } finally {
        this.updatingMemberId = null
      }
    },

    async markAsUnpaid(member) {
      this.updatingMemberId = member.member_id
      try {
        await membersService.updateKontingentPayment(
          member.member_id,
          this.currentMonth,
          false
        )
        // Reload data to show updated status
        await this.loadKontingentData()
      } catch (error) {
        console.error('Error marking as unpaid:', error)
        this.errorMessage = 'Kunne ikke oppdatere betalingsstatus. Prøv igjen.'
      } finally {
        this.updatingMemberId = null
      }
    },

    calculateAge(personnummer) {
      if (!personnummer || personnummer.length !== 11) {
        return 0
      }

      const day = parseInt(personnummer.substring(0, 2), 10)
      const month = parseInt(personnummer.substring(2, 4), 10) - 1
      const year = parseInt(personnummer.substring(4, 6), 10)

      const currentYear = new Date().getFullYear()
      const currentCentury = Math.floor(currentYear / 100) * 100
      const previousCentury = currentCentury - 100

      let fullYear = currentCentury + year
      if (fullYear > currentYear) {
        fullYear = previousCentury + year
      }

      const birthDate = new Date(fullYear, month, day)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }

      return age
    },

    formatDate(dateStr) {
      if (!dateStr) return ''
      return new Date(dateStr).toLocaleDateString('nb-NO')
    }
  }
}
</script>

<style scoped>
.members-kontingent {
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

.month-selector {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.selector-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.selector-group label {
  font-weight: 600;
  color: var(--gray-700);
  font-size: 0.875rem;
}

.selector-group select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  font-size: 1rem;
  background: white;
  color: var(--gray-900);
  cursor: pointer;
  min-width: 150px;
}

.selector-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  padding: 0.5rem 2rem;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2c5282;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading,
.no-data {
  text-align: center;
  padding: 3rem;
  color: var(--gray-600);
}

.alert-error {
  background-color: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.summary-card {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.summary-card h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: var(--gray-900);
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--gray-50);
  border-radius: 4px;
}

.summary-label {
  color: var(--gray-700);
}

.text-success {
  color: #155724;
}

.text-danger {
  color: #721c24;
}

.table-container {
  overflow-x: auto;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
}

.kontingent-table {
  width: 100%;
  border-collapse: collapse;
}

.kontingent-table th {
  background: var(--gray-50);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--gray-700);
  border-bottom: 2px solid var(--gray-200);
}

.kontingent-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--gray-100);
}

.member-name {
  font-weight: 500;
  color: var(--gray-900);
}

.payment-date {
  font-size: 0.85rem;
  color: var(--gray-600);
  margin-left: 0.5rem;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-success {
  background: #d4edda;
  color: #155724;
}

.badge-warning {
  background: #fff3cd;
  color: #856404;
}

.actions {
  text-align: right;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-success {
  background-color: #28a745;
  color: white;
  border: none;
}

.btn-success:hover:not(:disabled) {
  background-color: #218838;
}

.btn-warning {
  background-color: #ffc107;
  color: #212529;
  border: none;
}

.btn-warning:hover:not(:disabled) {
  background-color: #e0a800;
}

@media (max-width: 768px) {
  .members-kontingent {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .month-selector {
    flex-direction: column;
    align-items: stretch;
  }

  .selector-group {
    width: 100%;
  }

  .selector-group select {
    width: 100%;
  }

  .btn-primary {
    width: 100%;
  }

  .summary-stats {
    grid-template-columns: 1fr;
  }

  .kontingent-table {
    font-size: 0.85rem;
  }

  .kontingent-table th,
  .kontingent-table td {
    padding: 0.5rem;
  }
}
</style>
