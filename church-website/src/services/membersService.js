import axios from 'axios'

const API_URL = import.meta.env.VITE_MEMBERS_API_URL || 'http://localhost:3002'

const getAuthToken = () => localStorage.getItem('members_admin_token')

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(config => {
  const token = getAuthToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default {
  // Authentication
  async login(username, password) {
    const response = await api.post('/api/auth/login', { username, password })
    if (response.data.token) {
      localStorage.setItem('members_admin_token', response.data.token)
    }
    return response.data
  },

  logout() {
    localStorage.removeItem('members_admin_token')
  },

  isAuthenticated() {
    return !!getAuthToken()
  },

  // Members CRUD
  async getMembers(filters = {}) {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.active !== undefined) params.append('active', filters.active)

    const response = await api.get(`/api/members?${params}`)
    return response.data
  },

  async getMember(id) {
    const response = await api.get(`/api/members/${id}`)
    return response.data
  },

  async createMember(memberData) {
    const response = await api.post('/api/members', memberData)
    return response.data
  },

  async updateMember(id, memberData) {
    const response = await api.put(`/api/members/${id}`, memberData)
    return response.data
  },

  async deleteMember(id) {
    const response = await api.delete(`/api/members/${id}`)
    return response.data
  },

  // SMS Operations
  async sendSMS(data) {
    const response = await api.post('/api/sms/send', data)
    return response.data
  },

  async getSMSLogs(page = 1, limit = 50) {
    const response = await api.get(`/api/sms/logs?page=${page}&limit=${limit}`)
    return response.data
  },

  async getSMSStats() {
    const response = await api.get('/api/sms/stats')
    return response.data
  },

  // Kontingent Operations
  async getKontingentForMonth(month) {
    const response = await api.get(`/api/kontingent/${month}`)
    return response.data
  },

  async updateKontingentPayment(memberId, month, paid, amount = null, notes = null) {
    const response = await api.post('/api/kontingent/update', {
      memberId,
      month,
      paid,
      amount,
      notes
    })
    return response.data
  },

  // Admin Management Operations (Super Admin Only)
  async getAdmins() {
    const response = await api.get('/api/admins')
    return response.data
  },

  async createAdmin(adminData) {
    const response = await api.post('/api/admins', adminData)
    return response.data
  },

  async updateAdmin(id, adminData) {
    const response = await api.put(`/api/admins/${id}`, adminData)
    return response.data
  },

  async deleteAdmin(id) {
    const response = await api.delete(`/api/admins/${id}`)
    return response.data
  },

  // Dashboard Stats
  async getDashboardStats() {
    const members = await this.getMembers()
    const smsStats = await this.getSMSStats()

    // Calculate age from personnummer to count members 18+
    const calculateAge = (personnummer) => {
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
    }

    const membersOver18 = members.filter(m => {
      const age = calculateAge(m.personnummer)
      return age >= 18
    }).length

    return {
      totalMembers: members.length,
      activeMembers: members.filter(m => m.is_active).length,
      smsConsent: members.filter(m => m.sms_consent).length,
      membersOver18,
      ...smsStats
    }
  }
}
