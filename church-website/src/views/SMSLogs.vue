<template>
  <div class="sms-logs">
    <div class="page-header">
      <h1>SMS Historikk</h1>
      <div class="header-actions">
        <router-link to="/members/dashboard" class="btn btn-secondary">Tilbake</router-link>
        <router-link to="/members/send-sms" class="btn btn-primary">Send ny SMS</router-link>
      </div>
    </div>

    <div v-if="isLoading" class="loading">Laster SMS-historikk...</div>

    <div v-else-if="errorMessage" class="alert alert-error">
      {{ errorMessage }}
    </div>

    <div v-else>
      <div class="stats-summary">
        <div class="stat-box">
          <div class="stat-label">Totalt sendt</div>
          <div class="stat-value">{{ stats.totalSent || 0 }}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Denne måned</div>
          <div class="stat-value">{{ stats.thisMonth || 0 }}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Total kostnad</div>
          <div class="stat-value">~{{ stats.totalCost || 0 }} NOK</div>
        </div>
      </div>

      <div v-if="logs.length === 0" class="no-data">
        Ingen SMS sendt ennå
      </div>

      <div v-else class="logs-container">
        <div v-for="log in logs" :key="log.id" class="log-item">
          <div class="log-header">
            <div class="log-date">
              {{ formatDateTime(log.sent_at) }}
            </div>
            <div class="log-meta">
              <span class="badge badge-info">{{ log.recipient_count }} mottakere</span>
              <span class="badge badge-success">~{{ (log.recipient_count * 0.16).toFixed(2) }} NOK</span>
            </div>
          </div>

          <div class="log-message">
            {{ log.message }}
          </div>

          <div v-if="log.recipients && log.recipients.length > 0" class="log-recipients">
            <details>
              <summary>Se mottakere ({{ log.recipients.length }})</summary>
              <ul class="recipients-list">
                <li v-for="recipient in log.recipients" :key="recipient.id">
                  {{ recipient.full_name }} - {{ recipient.phone_number }}
                  <span
                    :class="['status', getStatusClass(recipient.status)]"
                  >
                    {{ recipient.status }}
                  </span>
                </li>
              </ul>
            </details>
          </div>

          <div class="log-footer">
            <span class="sent-by">Sendt av: {{ log.sent_by || 'Admin' }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import membersService from '../services/membersService'

export default {
  name: 'SMSLogs',
  data() {
    return {
      logs: [],
      stats: {
        totalSent: 0,
        thisMonth: 0,
        totalCost: 0
      },
      isLoading: true,
      errorMessage: ''
    }
  },
  async mounted() {
    await this.loadLogs()
  },
  methods: {
    async loadLogs() {
      try {
        const [logsData, statsData] = await Promise.all([
          membersService.getSMSLogs(),
          membersService.getSMSStats()
        ])

        this.logs = logsData
        this.stats = {
          totalSent: statsData.total_sent || 0,
          thisMonth: statsData.this_month || 0,
          totalCost: ((statsData.total_sent || 0) * 0.16).toFixed(2)
        }
      } catch (error) {
        console.error('Error loading SMS logs:', error)
        this.errorMessage = 'Kunne ikke laste SMS-historikk'
      } finally {
        this.isLoading = false
      }
    },

    formatDateTime(dateStr) {
      if (!dateStr) return 'N/A'
      const date = new Date(dateStr)
      return date.toLocaleString('nb-NO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    getStatusClass(status) {
      const statusMap = {
        sent: 'success',
        delivered: 'success',
        failed: 'error',
        pending: 'warning'
      }
      return statusMap[status] || 'default'
    }
  }
}
</script>

<style scoped>
.sms-logs {
  padding: 2rem;
  max-width: 1000px;
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

.stats-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-box {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--gray-600);
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: bold;
  color: var(--gray-900);
}

.logs-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.log-item {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  padding: 1.5rem;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.log-date {
  font-weight: 500;
  color: var(--gray-900);
}

.log-meta {
  display: flex;
  gap: 0.5rem;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-info {
  background: #d1ecf1;
  color: #0c5460;
}

.badge-success {
  background: #d4edda;
  color: #155724;
}

.log-message {
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
  white-space: pre-wrap;
  line-height: 1.5;
}

.log-recipients {
  margin-bottom: 1rem;
}

.log-recipients details {
  cursor: pointer;
}

.log-recipients summary {
  color: var(--primary-color);
  font-size: 0.9rem;
  padding: 0.5rem 0;
}

.recipients-list {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0 0;
  border: 1px solid var(--gray-200);
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
}

.recipients-list li {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--gray-100);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recipients-list li:last-child {
  border-bottom: none;
}

.status {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
  font-weight: 600;
}

.status.success {
  background: #d4edda;
  color: #155724;
}

.status.error {
  background: #f8d7da;
  color: #721c24;
}

.status.warning {
  background: #fff3cd;
  color: #856404;
}

.log-footer {
  font-size: 0.85rem;
  color: var(--gray-600);
}

@media (max-width: 768px) {
  .sms-logs {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .log-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .stats-summary {
    grid-template-columns: 1fr;
  }
}
</style>
