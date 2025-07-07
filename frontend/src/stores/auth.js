import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'
import router from '../router'

export const useAuthStore = defineStore('auth', () => {
  // État
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const error = ref(null)
  
  // Getters
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role?.name === 'admin')
  const isManager = computed(() => user.value?.role?.name === 'manager')
  const isCustomer = computed(() => user.value?.role?.name === 'customer')
  
  // Actions
  async function register(userData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post('/api/auth/register', userData)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de l\'inscription'
      throw error.value
    } finally {
      loading.value = false
    }
  }
  
  async function login(credentials) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post('/api/auth/login', credentials)
      const { token: authToken, user: userData } = response.data
      
      // Stocker le token et les informations utilisateur
      token.value = authToken
      user.value = userData
      localStorage.setItem('token', authToken)
      
      // Configurer le token pour les futures requêtes
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
      
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la connexion'
      throw error.value
    } finally {
      loading.value = false
    }
  }
  
  async function logout() {
    // Supprimer le token et les informations utilisateur
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    
    // Rediriger vers la page de connexion
    router.push({ name: 'login' })
  }
  
  async function forgotPassword(email) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post('/api/auth/forgot-password', { email })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la demande de réinitialisation'
      throw error.value
    } finally {
      loading.value = false
    }
  }
  
  async function resetPassword(token, password) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.post('/api/auth/reset-password', { token, password })
      return response.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe'
      throw error.value
    } finally {
      loading.value = false
    }
  }
  
  async function checkAuth() {
    if (!token.value) return
    
    // Configurer le token pour les requêtes
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    
    try {
      // Vérifier la validité du token
      const response = await api.get('/api/auth/verify-token')
      user.value = response.data.user
    } catch (err) {
      // Si le token est invalide, déconnecter l'utilisateur
      logout()
    }
  }
  
  async function updateProfile(profileData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.put('/api/users/profile', {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        postalCode: profileData.postalCode,
        country: profileData.country,
        driverLicenseNumber: profileData.driverLicenseNumber,
        latitude: profileData.latitude,
        longitude: profileData.longitude,
        profileImage: profileData.profileImage
      }, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      if (response.data && response.data.user) {
        user.value = response.data.user
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la mise à jour du profil'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function fetchCurrentUser() {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get('/api/users/profile', {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      if (response.data && response.data.user) {
        user.value = response.data.user
      }
      return user.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la récupération du profil'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  function setError(message) {
    error.value = message
    setTimeout(() => {
      error.value = null
    }, 3000)
  }
  
  return {
    // État
    user,
    token,
    loading,
    error,
    
    // Getters
    isAuthenticated,
    isAdmin,
    isManager,
    isCustomer,
    
    // Actions
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    checkAuth,
    updateProfile,
    fetchCurrentUser,
    setError
  }
})
