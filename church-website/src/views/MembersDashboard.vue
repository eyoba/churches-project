<template>
  <div class="members-dashboard">
    <div class="dashboard-header">
      <h1>Debre Iyesus Medlemssystem Dashboard</h1>
      <button @click="handleLogout" class="btn btn-secondary">Logg ut</button>
    </div>

    <div v-if="isLoading" class="loading">Laster statistikk...</div>

    <div v-else class="dashboard-content">
      <div class="action-cards">
        <router-link to="/members/list" class="action-card">
          <div class="action-icon">📋</div>
          <h3>Se alle medlemmer</h3>
          <p>Vis, søk og filtrer medlemslisten</p>
        </router-link>

        <router-link to="/members/add" class="action-card">
          <div class="action-icon">➕</div>
          <h3>Legg til medlem</h3>
          <p>Registrer nytt medlem i systemet</p>
        </router-link>

        <router-link to="/members/send-sms" class="action-card">
          <div class="action-icon">📨</div>
          <h3>Send SMS</h3>
          <p>Send melding til medlemmer</p>
        </router-link>

        <router-link to="/members/kontingent" class="action-card">
          <div class="action-icon">💰</div>
          <h3>Månedlig kontingent</h3>
          <p>Administrer medlemskontingent (18+ år)</p>
        </router-link>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalMembers }}</div>
            <div class="stat-label">Totale medlemmer</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.activeMembers }}</div>
            <div class="stat-label">Aktive medlemmer</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📱</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.smsConsent }}</div>
            <div class="stat-label">SMS samtykke</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">💬</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalSMS || 0 }}</div>
            <div class="stat-label">SMS sendt (totalt)</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🎂</div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.membersOver18 || 0 }}</div>
            <div class="stat-label">Medlemmer 18+ år</div>
          </div>
        </div>
      </div>

      <div class="secondary-actions">
        <router-link to="/members/sms-logs" class="action-card">
          <div class="action-icon">📊</div>
          <h3>SMS historikk</h3>
          <p>Se tidligere sendte meldinger</p>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import membersService from '../services/membersService'

export default {
  name: 'MembersDashboard',
  data() {
    return {
      stats: {
        totalMembers: 0,
        activeMembers: 0,
        smsConsent: 0,
        totalSMS: 0,
        membersOver18: 0
      },
      isLoading: true
    }
  },
  async mounted() {
    await this.loadStats()
  },
  methods: {
    async loadStats() {
      try {
        this.stats = await membersService.getDashboardStats()
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        this.isLoading = false
      }
    },
    handleLogout() {
      membersService.logout()
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.members-dashboard {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  margin: 0;
  color: var(--gray-900);
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--gray-600);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.stat-card {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}


.stat-icon {
  font-size: 2.5rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--gray-900);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--gray-600);
}

.action-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.secondary-actions {
  margin-top: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  padding: 1.5rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.action-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: var(--primary-color);
}

.action-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.action-card h3 {
  margin: 0 0 0.5rem 0;
  color: var(--gray-900);
}

.action-card p {
  margin: 0;
  color: var(--gray-600);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .members-dashboard {
    padding: 1rem;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .stats-grid,
  .action-cards,
  .secondary-actions {
    grid-template-columns: 1fr;
  }
}
</style>
