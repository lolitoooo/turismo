<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Connexion</h1>
        <p>Bienvenue sur Drive Turismo</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="auth-form">
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
        
        <div class="form-group">
          <label for="password">Mot de passe</label>
          <div class="password-input">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="password" 
              required 
              placeholder="Votre mot de passe"
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
        
        <div class="form-actions">
          <router-link to="/forgot-password" class="forgot-password">
            Mot de passe oublié ?
          </router-link>
        </div>
        
        <div class="form-submit">
          <button 
            type="submit" 
            class="btn-primary" 
            :disabled="loading"
          >
            <span v-if="loading">Connexion en cours...</span>
            <span v-else>Se connecter</span>
          </button>
        </div>
        
        <div class="auth-footer">
          <p>
            Vous n'avez pas de compte ? 
            <router-link to="/register" class="auth-link">
              S'inscrire
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useToast } from 'primevue/usetoast'

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()
    const toast = useToast()
    
    const email = ref('')
    const password = ref('')
    const showPassword = ref(false)
    const loading = ref(false)
    
    const handleLogin = async () => {
      loading.value = true
      
      try {
        await authStore.login({
          email: email.value,
          password: password.value
        })
        
        toast.add({
          severity: 'success',
          summary: 'Connexion réussie',
          detail: 'Bienvenue sur Drive Turismo',
          life: 3000
        })
        
        // Redirection vers la page demandée ou le tableau de bord
        const redirectPath = route.query.redirect || '/dashboard'
        router.push(redirectPath)
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Erreur de connexion',
          detail: error || 'Identifiants incorrects',
          life: 5000
        })
      } finally {
        loading.value = false
      }
    }
    
    return {
      email,
      password,
      showPassword,
      loading,
      handleLogin
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
  
  .form-actions {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1.5rem;
    
    .forgot-password {
      color: #1a73e8;
      text-decoration: none;
      font-size: 0.9rem;
      
      &:hover {
        text-decoration: underline;
      }
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
