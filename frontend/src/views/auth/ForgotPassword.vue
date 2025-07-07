<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Mot de passe oublié</h1>
        <p>Entrez votre adresse email pour réinitialiser votre mot de passe</p>
      </div>
      
      <form @submit.prevent="handleForgotPassword" class="auth-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required 
            placeholder="Votre adresse email"
            class="form-control"
          />
        </div>
        
        <div class="form-submit">
          <button 
            type="submit" 
            class="btn-primary" 
            :disabled="loading"
          >
            <span v-if="loading">Envoi en cours...</span>
            <span v-else>Envoyer le lien de réinitialisation</span>
          </button>
        </div>
        
        <div class="auth-footer">
          <p>
            <router-link to="/login" class="auth-link">
              Retour à la connexion
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useToast } from 'primevue/usetoast'

export default {
  name: 'ForgotPasswordView',
  setup() {
    const authStore = useAuthStore()
    const toast = useToast()
    
    const email = ref('')
    const loading = ref(false)
    
    const handleForgotPassword = async () => {
      loading.value = true
      
      try {
        await authStore.forgotPassword(email.value)
        
        toast.add({
          severity: 'success',
          summary: 'Email envoyé',
          detail: 'Si cette adresse email est associée à un compte, vous recevrez un lien de réinitialisation',
          life: 5000
        })
        
        email.value = ''
      } catch (error) {
        toast.add({
          severity: 'info',
          summary: 'Email envoyé',
          detail: 'Si cette adresse email est associée à un compte, vous recevrez un lien de réinitialisation',
          life: 5000
        })
      } finally {
        loading.value = false
      }
    }
    
    return {
      email,
      loading,
      handleForgotPassword
    }
  }
}
</script>

<style lang="scss" scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 2rem;
}

.auth-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 480px;
  padding: 3rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    font-family: 'Playfair Display', serif;
    font-size: 2.5rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #666;
    font-size: 1rem;
  }
}

.auth-form {
  .form-group {
    margin-bottom: 1.5rem;
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }
  }
  
  .form-control {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 1rem;
    transition: border-color 0.3s;
    
    &:focus {
      border-color: #1a73e8;
      outline: none;
    }
  }
  
  .form-submit {
    margin-bottom: 1.5rem;
    
    .btn-primary {
      width: 100%;
      padding: 0.75rem;
      background: #1a1a1a;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s;
      
      &:hover {
        background: #333;
      }
      
      &:disabled {
        background: #999;
        cursor: not-allowed;
      }
    }
  }
}

.auth-footer {
  text-align: center;
  margin-top: 1rem;
  
  p {
    color: #666;
    font-size: 0.9rem;
  }
  
  .auth-link {
    color: #1a73e8;
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
