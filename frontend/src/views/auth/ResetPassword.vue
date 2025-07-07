<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Réinitialiser le mot de passe</h1>
        <p>Créez un nouveau mot de passe pour votre compte</p>
      </div>
      
      <form @submit.prevent="handleResetPassword" class="auth-form">
        <div class="form-group">
          <label for="password">Nouveau mot de passe</label>
          <div class="password-input">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="password" 
              required 
              placeholder="Votre nouveau mot de passe"
              class="form-control"
            />
            <button 
              type="button" 
              class="password-toggle" 
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">Confirmer le mot de passe</label>
          <div class="password-input">
            <input 
              :type="showConfirmPassword ? 'text' : 'password'" 
              id="confirmPassword" 
              v-model="confirmPassword" 
              required 
              placeholder="Confirmez votre mot de passe"
              class="form-control"
            />
            <button 
              type="button" 
              class="password-toggle" 
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <i :class="showConfirmPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
        </div>
        
        <div class="form-submit">
          <button 
            type="submit" 
            class="btn-primary" 
            :disabled="loading || !isFormValid"
          >
            <span v-if="loading">Réinitialisation en cours...</span>
            <span v-else>Réinitialiser le mot de passe</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useToast } from 'primevue/usetoast'

export default {
  name: 'ResetPasswordView',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const toast = useToast()
    
    const token = ref(route.query.token || '')
    const password = ref('')
    const confirmPassword = ref('')
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)
    const loading = ref(false)
    
    const isFormValid = computed(() => {
      return password.value && 
             confirmPassword.value && 
             password.value === confirmPassword.value &&
             password.value.length >= 6
    })
    
    const handleResetPassword = async () => {
      if (!isFormValid.value) {
        if (password.value !== confirmPassword.value) {
          toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Les mots de passe ne correspondent pas',
            life: 3000
          })
        } else if (password.value.length < 6) {
          toast.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Le mot de passe doit contenir au moins 6 caractères',
            life: 3000
          })
        }
        return
      }
      
      if (!token.value) {
        toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Token de réinitialisation manquant',
          life: 3000
        })
        return
      }
      
      loading.value = true
      
      try {
        await authStore.resetPassword(token.value, password.value)
        
        toast.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Votre mot de passe a été réinitialisé avec succès',
          life: 3000
        })
        
        router.push('/login')
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error || 'Une erreur est survenue lors de la réinitialisation du mot de passe',
          life: 5000
        })
      } finally {
        loading.value = false
      }
    }
    
    return {
      password,
      confirmPassword,
      showPassword,
      showConfirmPassword,
      loading,
      isFormValid,
      handleResetPassword
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
  
  .password-input {
    position: relative;
    
    .password-toggle {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: #666;
      cursor: pointer;
      
      &:hover {
        color: #333;
      }
    }
  }
  
  .form-submit {
    margin-top: 2rem;
    
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
</style>
