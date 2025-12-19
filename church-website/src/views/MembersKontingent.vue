<template>
  <div class="members-kontingent">
    <div class="page-header">
      <h1>Månedlig kontingent</h1>
      <router-link to="/members/dashboard" class="btn btn-secondary">Tilbake til dashboard</router-link>
    </div>

    <div class="view-toggle">
      <button
        @click="viewMode = 'monthly'"
        :class="['toggle-btn', { active: viewMode === 'monthly' }]"
      >
        Månedsvisning
      </button>
      <button
        @click="viewMode = 'yearly'"
        :class="['toggle-btn', { active: viewMode === 'yearly' }]"
      >
        Årsvisning per medlem
      </button>
    </div>

    <!-- Monthly View (Original) -->
    <div v-if="viewMode === 'monthly'">
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

    <div v-if="!isLoading && members.length > 0" class="search-box">
      <label for="search-input">Søk:</label>
      <input
        id="search-input"
        type="text"
        v-model="searchQuery"
        placeholder="Søk etter navn eller telefon..."
        class="search-input"
      />
      <span v-if="searchQuery" class="search-results">
        Viser {{ filteredMembers.length }} av {{ members.length }} medlemmer
      </span>
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

      <div v-if="filteredMembers.length === 0" class="no-data">
        Ingen medlemmer funnet med søk "{{ searchQuery }}"
      </div>

      <div v-else class="table-container">
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
            <tr v-for="member in filteredMembers" :key="member.member_id">
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
    <!-- End Monthly View -->

    <!-- Yearly View per Member -->
    <div v-if="viewMode === 'yearly'">
      <div class="yearly-selector">
        <div class="selector-group">
          <label for="yearly-year-select">År:</label>
          <select id="yearly-year-select" v-model="yearlySelectedYear" @change="loadYearlyData">
            <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
          </select>
        </div>
        <div class="selector-group" style="flex: 2;">
          <label for="member-select">Velg medlem:</label>
          <select id="member-select" v-model="selectedMemberId" @change="loadMemberYearlyPayments">
            <option value="">-- Velg et medlem --</option>
            <option v-for="member in allMembers18Plus" :key="member.id" :value="member.id">
              {{ member.full_name }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="isLoadingYearly" class="loading">Laster...</div>

      <div v-else-if="!selectedMemberId" class="no-data">
        Velg et medlem for å se årsvisning
      </div>

      <div v-else-if="selectedMemberData" class="yearly-view-container">
        <div class="member-info-card">
          <h3>{{ selectedMemberData.full_name }}</h3>
          <p v-if="selectedMemberData.phone_number">📱 {{ selectedMemberData.phone_number }}</p>
        </div>

        <div class="months-grid">
          <div
            v-for="(monthData, index) in monthsData"
            :key="index"
            class="month-card"
          >
            <div class="month-name">{{ monthData.name }}</div>
            <div class="month-status">
              <span :class="['badge', monthData.paid ? 'badge-success' : 'badge-warning']">
                {{ monthData.paid ? 'Betalt' : 'Ikke betalt' }}
              </span>
              <span v-if="monthData.payment_date" class="payment-date-small">
                {{ formatDateShort(monthData.payment_date) }}
              </span>
            </div>
            <button
              v-if="!monthData.paid"
              @click="toggleMonthPayment(monthData, true)"
              class="btn btn-sm btn-success month-btn"
              :disabled="updatingMonth === monthData.month"
            >
              {{ updatingMonth === monthData.month ? '...' : 'Betalt' }}
            </button>
            <button
              v-else
              @click="toggleMonthPayment(monthData, false)"
              class="btn btn-sm btn-warning month-btn"
              :disabled="updatingMonth === monthData.month"
            >
              {{ updatingMonth === monthData.month ? '...' : 'Ikke betalt' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- End Yearly View -->
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
      // Monthly view data
      members: [],
      selectedMonth: currentMonth,
      selectedYear: currentYear.toString(),
      isLoading: false,
      errorMessage: '',
      updatingMemberId: null,
      searchQuery: '',

      // View mode toggle
      viewMode: 'monthly', // 'monthly' or 'yearly'

      // Yearly view data
      yearlySelectedYear: currentYear.toString(),
      selectedMemberId: '',
      allMembers18Plus: [],
      selectedMemberData: null,
      monthsData: [],
      isLoadingYearly: false,
      updatingMonth: null
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
    filteredMembers() {
      if (!this.searchQuery.trim()) {
        return this.members
      }

      const query = this.searchQuery.toLowerCase().trim()
      return this.members.filter(member => {
        const name = (member.full_name || '').toLowerCase()
        const phone = (member.phone_number || '').toLowerCase()
        return name.includes(query) || phone.includes(query)
      })
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
    },

    formatDateShort(dateStr) {
      if (!dateStr) return ''
      const date = new Date(dateStr)
      return `${date.getDate()}/${date.getMonth() + 1}`
    },

    // Yearly view methods
    async loadYearlyData() {
      this.isLoadingYearly = true
      this.selectedMemberId = ''
      this.selectedMemberData = null

      try {
        // Fetch all active members
        const allMembers = await membersService.getMembers({ active: true })

        // Filter members 18+ based on personnummer
        this.allMembers18Plus = allMembers
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
        console.error('Error loading members:', error)
      } finally {
        this.isLoadingYearly = false
      }
    },

    async loadMemberYearlyPayments() {
      if (!this.selectedMemberId) {
        this.selectedMemberData = null
        this.monthsData = []
        return
      }

      this.isLoadingYearly = true

      try {
        // Find selected member
        this.selectedMemberData = this.allMembers18Plus.find(m => m.id === parseInt(this.selectedMemberId))

        // Fetch payment data for all 12 months of the selected year
        const monthNames = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
                            'Juli', 'August', 'September', 'Oktober', 'November', 'Desember']

        const monthsPromises = monthNames.map(async (name, index) => {
          const monthNum = String(index + 1).padStart(2, '0')
          const yearMonth = `${this.yearlySelectedYear}-${monthNum}`

          const data = await membersService.getKontingentForMonth(yearMonth)
          const memberPayment = data.find(m => m.member_id === parseInt(this.selectedMemberId))

          return {
            name,
            month: monthNum,
            yearMonth,
            paid: memberPayment ? memberPayment.paid : false,
            payment_date: memberPayment ? memberPayment.payment_date : null
          }
        })

        this.monthsData = await Promise.all(monthsPromises)
      } catch (error) {
        console.error('Error loading member yearly payments:', error)
      } finally {
        this.isLoadingYearly = false
      }
    },

    async toggleMonthPayment(monthData, paid) {
      this.updatingMonth = monthData.month

      try {
        await membersService.updateKontingentPayment(
          parseInt(this.selectedMemberId),
          monthData.yearMonth,
          paid
        )

        // Reload member's yearly data
        await this.loadMemberYearlyPayments()
      } catch (error) {
        console.error('Error updating payment:', error)
      } finally {
        this.updatingMonth = null
      }
    }
  },

  watch: {
    viewMode(newMode) {
      if (newMode === 'yearly' && this.allMembers18Plus.length === 0) {
        this.loadYearlyData()
      }
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

.search-box {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box label {
  font-weight: 600;
  color: var(--gray-700);
  font-size: 0.875rem;
}

.search-input {
  flex: 1;
  min-width: 250px;
  padding: 0.75rem 1rem;
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  font-size: 1rem;
  color: var(--gray-900);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.search-input::placeholder {
  color: var(--gray-400);
}

.search-results {
  color: var(--gray-600);
  font-size: 0.875rem;
  font-weight: 500;
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

/* View Toggle */
.view-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  padding: 0.5rem;
}

.toggle-btn {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--gray-700);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-btn:hover {
  background: var(--gray-50);
}

.toggle-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* Yearly View Styles */
.yearly-selector {
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

.yearly-view-container {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  padding: 2rem;
}

.member-info-card {
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
}

.member-info-card h3 {
  margin: 0 0 0.5rem 0;
  color: var(--gray-900);
}

.member-info-card p {
  margin: 0;
  color: var(--gray-600);
}

.months-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.month-card {
  background: white;
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.2s;
}

.month-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.month-name {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--gray-900);
  text-align: center;
}

.month-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  min-height: 50px;
}

.payment-date-small {
  font-size: 0.75rem;
  color: var(--gray-600);
}

.month-btn {
  width: 100%;
  padding: 0.5rem;
  font-size: 0.875rem;
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

  .view-toggle {
    flex-direction: column;
  }

  .toggle-btn {
    width: 100%;
  }

  .month-selector,
  .yearly-selector {
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

  .search-box {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-input {
    width: 100%;
    min-width: unset;
  }

  .search-results {
    width: 100%;
    text-align: center;
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

  .months-grid {
    grid-template-columns: 1fr;
  }

  .yearly-view-container {
    padding: 1rem;
  }
}
</style>
