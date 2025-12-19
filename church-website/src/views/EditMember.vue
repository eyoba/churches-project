<template>
  <div class="edit-member">
    <div class="page-header">
      <h1>Rediger medlem</h1>
      <router-link to="/members/list" class="btn btn-secondary">Tilbake til listen</router-link>
    </div>

    <div v-if="isLoading" class="loading">Laster medlemsdata...</div>

    <div v-else-if="loadError" class="alert alert-error">
      {{ loadError }}
    </div>

    <div v-else class="form-container">
      <form @submit.prevent="handleSubmit">
        <div class="form-section">
          <h3>Personopplysninger</h3>

          <div class="form-group">
            <label for="full_name">Fullt navn *</label>
            <input
              type="text"
              id="full_name"
              v-model="formData.full_name"
              required
              :disabled="isSubmitting"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="phone_number">Mobilnummer</label>
              <input
                type="tel"
                id="phone_number"
                v-model="formData.phone_number"
                placeholder="+47 xxx xx xxx"
                :disabled="isSubmitting"
              />
              <small class="form-hint">Valgfritt - barn uten mobil kan hoppes over</small>
            </div>

            <div class="form-group">
              <label for="email">E-post</label>
              <input
                type="email"
                id="email"
                v-model="formData.email"
                :disabled="isSubmitting"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="personnummer">Personnummer (11 siffer) *</label>
            <input
              type="text"
              id="personnummer"
              v-model="formData.personnummer"
              placeholder="DDMMYYXXXXX"
              maxlength="11"
              pattern="\d{11}"
              required
              :disabled="isSubmitting"
            />
            <small class="form-hint">Sensitiv informasjon - behandles konfidensielt</small>
          </div>
        </div>

        <div class="form-section">
          <h3>Adresse</h3>

          <div class="form-group">
            <label for="address">Gateadresse</label>
            <input
              type="text"
              id="address"
              v-model="formData.address"
              :disabled="isSubmitting"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="postal_code">Postnummer</label>
              <input
                type="text"
                id="postal_code"
                v-model="formData.postal_code"
                maxlength="10"
                :disabled="isSubmitting"
              />
            </div>

            <div class="form-group">
              <label for="city">Poststed</label>
              <input
                type="text"
                id="city"
                v-model="formData.city"
                :disabled="isSubmitting"
              />
            </div>
          </div>
        </div>

        <div class="form-section">
          <h3>Medlemsinformasjon</h3>

          <div class="form-group">
            <label for="member_since">Medlem siden</label>
            <input
              type="date"
              id="member_since"
              v-model="formData.member_since"
              :disabled="isSubmitting"
            />
          </div>

          <div class="form-row">
            <div class="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  v-model="formData.baptized"
                  :disabled="isSubmitting"
                />
                Døpt
              </label>
            </div>

            <div class="form-group" v-if="formData.baptized">
              <label for="baptism_date">Dåpsdato</label>
              <input
                type="date"
                id="baptism_date"
                v-model="formData.baptism_date"
                :disabled="isSubmitting"
              />
            </div>
          </div>

          <div class="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                v-model="formData.sms_consent"
                :disabled="isSubmitting"
              />
              Samtykke til SMS-varsling
            </label>
            <small class="form-hint">Medlemmet godtar å motta SMS fra kirken (GDPR)</small>
          </div>

          <div class="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                v-model="formData.is_active"
                :disabled="isSubmitting"
              />
              Aktivt medlem
            </label>
          </div>

          <div class="form-group">
            <label for="notes">Notater</label>
            <textarea
              id="notes"
              v-model="formData.notes"
              rows="4"
              :disabled="isSubmitting"
            ></textarea>
          </div>
        </div>

        <div v-if="errorMessage" class="alert alert-error">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="alert alert-success">
          {{ successMessage }}
        </div>

        <div class="form-actions">
          <router-link to="/members/list" class="btn btn-secondary">Avbryt</router-link>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Lagrer...' : 'Lagre endringer' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import membersService from '../services/membersService'

export default {
  name: 'EditMember',
  data() {
    return {
      formData: {
        full_name: '',
        phone_number: '',
        email: '',
        personnummer: '',
        address: '',
        postal_code: '',
        city: '',
        member_since: '',
        baptized: false,
        baptism_date: '',
        sms_consent: true,
        is_active: true,
        notes: ''
      },
      isLoading: true,
      isSubmitting: false,
      errorMessage: '',
      successMessage: '',
      loadError: ''
    }
  },
  async mounted() {
    await this.loadMember()
  },
  methods: {
    async loadMember() {
      const memberId = this.$route.params.id
      if (!memberId) {
        this.loadError = 'Ugyldig medlems-ID'
        this.isLoading = false
        return
      }

      try {
        const member = await membersService.getMember(memberId)

        // Format dates for input fields
        if (member.member_since) {
          member.member_since = member.member_since.split('T')[0]
        }
        if (member.baptism_date) {
          member.baptism_date = member.baptism_date.split('T')[0]
        }

        // Remove personnummer dashes if present
        if (member.personnummer) {
          member.personnummer = member.personnummer.replace(/-/g, '')
        }

        this.formData = { ...this.formData, ...member }
      } catch (error) {
        console.error('Error loading member:', error)
        this.loadError = 'Kunne ikke laste medlem. Prøv igjen.'
      } finally {
        this.isLoading = false
      }
    },

    async handleSubmit() {
      this.isSubmitting = true
      this.errorMessage = ''
      this.successMessage = ''

      try {
        const memberId = this.$route.params.id
        await membersService.updateMember(memberId, this.formData)
        this.successMessage = 'Medlem oppdatert!'

        setTimeout(() => {
          this.$router.push('/members/list')
        }, 1500)
      } catch (error) {
        console.error('Error updating member:', error)
        this.errorMessage = error.response?.data?.error || 'Kunne ikke oppdatere medlem. Prøv igjen.'
      } finally {
        this.isSubmitting = false
      }
    }
  }
}
</script>

<style scoped>
.edit-member {
  padding: 2rem;
  max-width: 900px;
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

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--gray-600);
}

.form-container {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  padding: 2rem;
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--gray-200);
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--gray-800);
  font-size: 1.1rem;
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

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled,
.form-group textarea:disabled {
  background-color: var(--gray-100);
  cursor: not-allowed;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.form-hint {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.85rem;
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

.alert-success {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .edit-member {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .form-container {
    padding: 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
