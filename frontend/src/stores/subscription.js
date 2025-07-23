import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import apiClient from '../services/api'
import { useAuthStore } from './auth'

export const useSubscriptionStore = defineStore('subscription', () => {
  // État
  const activeSubscription = ref(null)
  const subscriptions = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  // Getters
  const hasActiveSubscription = computed(() => {
    if (!activeSubscription.value) return false
    
    // Vérifier si l'abonnement existe et est valide (date d'expiration future)
    return activeSubscription.value
  })
  
  const remainingDays = computed(() => {
    if (!activeSubscription.value) return 0
    
    const today = new Date()
    const expiryDate = new Date(activeSubscription.value.expiryDate)
    
    // Calculer la différence en jours
    const diffTime = expiryDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays > 0 ? diffDays : 0
  })
  
  // Getter pour obtenir le niveau d'abonnement actif
  const subscriptionLevel = computed(() => {
    if (!activeSubscription.value || !activeSubscription.value.subscriptionType) return null
    return activeSubscription.value.subscriptionType
  })
  
  // Getter pour obtenir le niveau maximum de catégorie de voiture accessible
  const maxCarCategoryLevel = computed(() => {
    if (!activeSubscription.value || !activeSubscription.value.subscriptionType) return 0
    
    // Récupérer le niveau d'abonnement (Starter=1, Urban=2, Executive=3, Prestige=4, Elite=5, Signature=6)
    const subType = activeSubscription.value.subscriptionType
    
    // Si features est disponible et contient level, utiliser cette valeur
    if (subType.features && subType.features.level) {
      return subType.features.level
    }
    
    // Sinon, utiliser l'ID du type d'abonnement comme niveau
    return subType.id || 0
  })
  
  // Actions
  async function fetchSubscriptions() {
    loading.value = true
    error.value = null
    
    try {
      const response = await apiClient.get('/api/subscriptions')
      
      if (response && response.data && response.data.subscriptions) {
        subscriptions.value = response.data.subscriptions
      }
      
      return subscriptions.value
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur lors de la récupération des abonnements'
      throw error.value
    } finally {
      loading.value = false
    }
  }
  
  async function fetchActiveSubscription() {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      
      // Vérifier si l'utilisateur est connecté
      if (!authStore.isAuthenticated) {
        console.warn('Utilisateur non connecté, impossible de récupérer l\'abonnement')
        return null
      }
      
      // Configuration des headers avec le token d'authentification
      const config = {
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      }
      
      // Récupérer l'abonnement actif depuis l'API
      // Utiliser l'ID de l'utilisateur connecté pour accéder à son abonnement
      const userId = authStore.user?.id
      if (!userId) {
        console.warn('ID utilisateur non disponible, impossible de récupérer l\'abonnement')
        return null
      }
      const response = await apiClient.get(`/api/userSubscription/user/${userId}/subscription`, config)
      
      // Le backend renvoie { success: true, subscription: {...} } 
      if (response && response.data && response.data.success && response.data.subscription) {
        activeSubscription.value = response.data.subscription
        console.log('Abonnement actif récupéré avec succès:', activeSubscription.value)
        return activeSubscription.value
      }
      
      activeSubscription.value = null
      return null
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'abonnement actif:', err)
      error.value = err.response?.data?.message || 'Erreur lors de la récupération de l\'abonnement actif'
      activeSubscription.value = null
      return null
    } finally {
      loading.value = false
    }
  }
  
  async function subscribeToSubscription(subscriptionId, userData) {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      
      // Vérifier si l'utilisateur est connecté
      if (!authStore.isAuthenticated) {
        throw new Error('Utilisateur non connecté')
      }
      
      const userId = authStore.user?.id
      
      if (!userId) {
        throw new Error('ID utilisateur non disponible')
      }
      
      // Configuration des headers avec le token d'authentification
      const config = {
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      }
      
      // Appeler l'API pour enregistrer l'abonnement
      const response = await apiClient.post('/api/userSubscription/user/subscription', {
        userId,
        subscriptionId,
        userData
      }, config)
      
      // Récupérer l'abonnement mis à jour
      await fetchActiveSubscription()
      
      return response.data
    } catch (err) {
      console.error(`Erreur lors de la souscription à l'abonnement ${subscriptionId}:`, err)
      error.value = err.response?.data?.message || `Erreur lors de la souscription à l'abonnement`
      throw error.value
    } finally {
      loading.value = false
    }
  }
  
  async function cancelSubscription() {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      
      // Vérifier si l'utilisateur est connecté
      if (!authStore.isAuthenticated) {
        throw new Error('Utilisateur non connecté')
      }
      
      const userId = authStore.user?.id
      
      if (!userId) {
        throw new Error('ID utilisateur non disponible')
      }
      
      // Configuration des headers avec le token d'authentification
      const config = {
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      }
      
      // Appeler l'API pour annuler l'abonnement
      const response = await apiClient.delete(`/api/userSubscription/user/${userId}/subscription`, config)
      
      // Réinitialiser l'abonnement actif
      activeSubscription.value = null
      
      return response.data
    } catch (err) {
      console.error('Erreur lors de l\'annulation de l\'abonnement:', err)
      error.value = err.response?.data?.message || 'Erreur lors de l\'annulation de l\'abonnement'
      throw error.value
    } finally {
      loading.value = false
    }
  }
  
  async function getSubscriptionById(id) {
    try {
      // Si les abonnements ne sont pas encore chargés, les récupérer
      if (subscriptions.value.length === 0) {
        await fetchSubscriptions()
      }
      
      // Convertir l'ID en nombre pour la comparaison
      const numericId = parseInt(id, 10)
      return subscriptions.value.find(subscription => subscription.id === numericId) || null
    } catch (err) {
      console.error(`Erreur lors de la récupération de l'abonnement ${id}:`, err)
      return null
    }
  }
  
  // Fonction pour créer un nouvel abonnement en base de données
  async function createSubscription(subscriptionTypeId, userId, startDate = new Date(), durationMonths = 1) {
    loading.value = true
    error.value = null
    
    try {
      const authStore = useAuthStore()
      
      // Vérifier si l'utilisateur est connecté
      if (!authStore.isAuthenticated) {
        throw new Error('Utilisateur non connecté')
      }
      
      // Configuration des headers avec le token d'authentification
      const config = {
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      }
      
      // Calculer la date d'expiration
      const expiryDate = new Date(startDate)
      expiryDate.setMonth(expiryDate.getMonth() + durationMonths)
      
      // Préparer les données de l'abonnement
      const subscriptionData = {
        userId: userId || authStore.user.id,
        subscriptionTypeId,
        startDate: startDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        status: 'active',
        autoRenew: true
      }
      
      // Appeler l'API pour créer l'abonnement
      const response = await apiClient.post('/api/subscriptions', subscriptionData, config)
      
      if (response && response.data && response.data.success) {
        // Mettre à jour l'abonnement actif
        await fetchActiveSubscription()
        return response.data.subscription
      }
      
      throw new Error('Erreur lors de la création de l\'abonnement')
    } catch (err) {
      console.error('Erreur lors de la création de l\'abonnement:', err)
      error.value = err.response?.data?.message || 'Erreur lors de la création de l\'abonnement'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return {
    // État
    activeSubscription,
    subscriptions,
    loading,
    error,
    hasActiveSubscription,
    remainingDays,
    subscriptionLevel,
    maxCarCategoryLevel,
    // Actions
    fetchSubscriptions,
    fetchActiveSubscription,
    subscribeToSubscription,
    cancelSubscription,
    getSubscriptionById,
    createSubscription
  }
})
