<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-brand">
        <router-link to="/" class="logo">
          <span class="logo-text">TURISMO</span>
        </router-link>
      </div>
      
      <div class="navbar-menu">
        <div class="navbar-start">
          <router-link to="/" class="navbar-item">Accueil</router-link>
          <router-link to="/cars" class="navbar-item">Véhicules</router-link>
          <router-link to="/subscriptions" class="navbar-item">Abonnements</router-link>
          <router-link to="/about" class="navbar-item">À propos</router-link>
          <router-link to="/contact" class="navbar-item">Contact</router-link>
        </div>
        
        <div class="navbar-end">
          <template v-if="isAuthenticated">
            <div class="navbar-item has-dropdown">
              <button class="navbar-link" @click="toggleDropdown">
                {{ user?.firstName || 'Mon compte' }}
                <i class="pi pi-chevron-down dropdown-icon"></i>
              </button>
              
              <div class="navbar-dropdown" :class="{ 'is-active': dropdownActive }">
                <router-link to="/dashboard" class="dropdown-item">
                  <i class="pi pi-home"></i> Tableau de bord
                </router-link>
                <router-link to="/profile" class="dropdown-item">
                  <i class="pi pi-user"></i> Mon profil
                </router-link>
                <router-link to="/reservations" class="dropdown-item">
                  <i class="pi pi-calendar"></i> Mes réservations
                </router-link>
                <router-link to="/subscriptions" class="dropdown-item">
                  <i class="pi pi-star"></i> Mes abonnements
                </router-link>
                <hr class="dropdown-divider">
                <a href="#" class="dropdown-item" @click.prevent="handleLogout">
                  <i class="pi pi-sign-out"></i> Déconnexion
                </a>
              </div>
            </div>
          </template>
          
          <template v-else>
            <div class="auth-buttons">
              <router-link to="/login" class="btn-login">Connexion</router-link>
              <router-link to="/register" class="btn-register">S'inscrire</router-link>
            </div>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'

export default {
  name: 'Navbar',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    const toast = useToast()
    
    const dropdownActive = ref(false)
    
    const isAuthenticated = computed(() => authStore.isAuthenticated)
    const user = computed(() => authStore.user)
    
    const toggleDropdown = () => {
      dropdownActive.value = !dropdownActive.value
    }
    
    const closeDropdown = (event) => {
      if (dropdownActive.value && !event.target.closest('.has-dropdown')) {
        dropdownActive.value = false
      }
    }
    
    const handleLogout = async () => {
      try {
        await authStore.logout()
        toast.add({
          severity: 'success',
          summary: 'Déconnexion réussie',
          detail: 'À bientôt !',
          life: 3000
        })
        router.push('/')
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Une erreur est survenue lors de la déconnexion',
          life: 3000
        })
      }
    }
    
    onMounted(() => {
      document.addEventListener('click', closeDropdown)
    })
    
    onBeforeUnmount(() => {
      document.removeEventListener('click', closeDropdown)
    })
    
    return {
      isAuthenticated,
      user,
      dropdownActive,
      toggleDropdown,
      handleLogout
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0.75rem 0;
}

.navbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.navbar-brand {
  .logo {
    text-decoration: none;
    display: flex;
    align-items: center;
    
    .logo-text {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a1a1a;
      letter-spacing: 1px;
    }
  }
}

.navbar-menu {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
  margin-left: 2rem;
}

.navbar-start {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  
  .navbar-item {
    color: #333;
    text-decoration: none;
    font-size: 0.95rem;
    font-weight: 500;
    padding: 0.5rem 0;
    position: relative;
    transition: color 0.3s;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 2px;
      background-color: #1a1a1a;
      transition: width 0.3s;
    }
    
    &:hover, &.router-link-active {
      color: #1a1a1a;
      
      &::after {
        width: 100%;
      }
    }
  }
}

.navbar-end {
  display: flex;
  align-items: center;
  
  .auth-buttons {
    display: flex;
    align-items: center;
    gap: 1rem;
    
    .btn-login {
      color: #1a1a1a;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background-color 0.3s;
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }
    
    .btn-register {
      background-color: #1a1a1a;
      color: white;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background-color 0.3s;
      
      &:hover {
        background-color: #333;
      }
    }
  }
  
  .has-dropdown {
    position: relative;
    
    .navbar-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #1a1a1a;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      border: none;
      background: none;
      cursor: pointer;
      transition: background-color 0.3s;
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
      
      .dropdown-icon {
        font-size: 0.75rem;
        transition: transform 0.3s;
      }
    }
    
    .navbar-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      background-color: white;
      border-radius: 6px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
      min-width: 200px;
      padding: 0.5rem 0;
      margin-top: 0.5rem;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s;
      
      &.is-active {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }
      
      .dropdown-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        color: #333;
        text-decoration: none;
        font-size: 0.95rem;
        transition: background-color 0.3s;
        
        i {
          font-size: 1rem;
          color: #666;
        }
        
        &:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
      }
      
      .dropdown-divider {
        height: 1px;
        background-color: #eee;
        margin: 0.5rem 0;
        border: none;
      }
    }
  }
}

@media (max-width: 768px) {
  .navbar-menu {
    position: fixed;
    top: 60px;
    left: 0;
    right: 0;
    background: white;
    flex-direction: column;
    align-items: flex-start;
    padding: 1rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-100%);
    transition: transform 0.3s;
    
    &.is-active {
      transform: translateY(0);
    }
    
    .navbar-start {
      flex-direction: column;
      align-items: flex-start;
      width: 100%;
    }
    
    .navbar-end {
      margin-top: 1rem;
      width: 100%;
    }
  }
}
</style>
