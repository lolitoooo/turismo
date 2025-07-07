<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>Inscription</h1>
        <p>Rejoignez Drive Turismo</p>
      </div>
      
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-row">
          <div class="form-group">
            <label for="firstName">Prénom</label>
            <input 
              type="text" 
              id="firstName" 
              v-model="firstName" 
              required 
              placeholder="Votre prénom"
              class="form-control"
            />
          </div>
          
          <div class="form-group">
            <label for="lastName">Nom</label>
            <input 
              type="text" 
              id="lastName" 
              v-model="lastName" 
              required 
              placeholder="Votre nom"
              class="form-control"
            />
          </div>
        </div>
        
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
              placeholder="Créez votre mot de passe (min. 6 caractères)"
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
          <small class="password-hint">Le mot de passe doit contenir au moins 6 caractères</small>
        </div>
        
        <div class="form-group terms">
          <div class="checkbox-wrapper">
            <input 
              type="checkbox" 
              id="terms" 
              v-model="termsAccepted" 
              required
            />
            <label for="terms">
              J'accepte les <a href="#" class="terms-link">conditions d'utilisation</a> et la <a href="#" class="terms-link">politique de confidentialité</a>
            </label>
          </div>
        </div>
        
        <div class="form-submit">
          <button 
            type="submit" 
            class="btn-primary" 
            :disabled="loading || !termsAccepted || password.length < 6"
          >
            <span v-if="loading">Inscription en cours...</span>
            <span v-else>S'inscrire</span>
          </button>
        </div>
        
        <div class="auth-footer">
          <p>
            Vous avez déjà un compte ? 
            <router-link to="/login" class="auth-link">
              Se connecter
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useToast } from 'primevue/usetoast'

export default {
  name: 'RegisterView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()
    const toast = useToast()
    
    const firstName = ref('')
    const lastName = ref('')
    const email = ref('')
    const password = ref('')
    const showPassword = ref(false)
    const termsAccepted = ref(false)
    const loading = ref(false)
    
    const handleRegister = async () => {
      if (password.value.length < 6) {
        toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Le mot de passe doit contenir au moins 6 caractères',
          life: 3000
        })
        return
      }
      
      loading.value = true
      
      try {
        await authStore.register({
          firstName: firstName.value,
          lastName: lastName.value,
          email: email.value,
          password: password.value
        })
        
        toast.add({
          severity: 'success',
          summary: 'Inscription réussie',
          detail: 'Votre compte a été créé avec succès',
          life: 3000
        })
        
        // Redirection vers la page de connexion
        router.push('/login')
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Erreur d\'inscription',
          detail: error || 'Une erreur est survenue lors de l\'inscription',
          life: 5000
        })
      } finally {
        loading.value = false
      }
    }
    
    return {
      firstName,
      lastName,
      email,
      password,
      showPassword,
      termsAccepted,
      loading,
      handleRegister
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
  max-width: 520px;
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
  .form-row {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
    
    @media (max-width: 576px) {
      flex-direction: column;
      gap: 0;
    }
    
    .form-group {
      flex: 1;
    }
  }
  
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
  
  .password-hint {
    display: block;
    margin-top: 0.5rem;
    color: #666;
    font-size: 0.8rem;
  }
  
  .terms {
    .checkbox-wrapper {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      
      input[type="checkbox"] {
        margin-top: 0.2rem;
      }
      
      label {
        font-size: 0.9rem;
        color: #666;
        margin-bottom: 0;
      }
      
      .terms-link {
        color: #1a73e8;
        text-decoration: none;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
  
  .form-submit {
    margin-top: 1.5rem;
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
