import apiClient from './api.service'
import { useAuthStore } from '../stores/auth'

// Service pour gérer les réservations
export default {
  /**
   * Récupérer toutes les réservations de l'utilisateur connecté
   * @returns {Promise<Array>} Liste des réservations
   */
  async getUserReservations() {
    try {
      const response = await apiClient.get('/api/reservations/my-reservations')
      console.log('Réponse de l\'API reservations:', response.data)
      return response.data.reservations || []
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error)
      return []
    }
  },

  /**
   * Récupérer les dates réservées pour un véhicule spécifique
   * @param {number} carId ID du véhicule
   * @returns {Promise<Array>} Liste des périodes réservées (objets avec start et end)
   */
  async getReservedDatesForCar(carId) {
    try {
      const response = await apiClient.get(`/api/reservations/car/${carId}/reserved-dates`) 
      console.log('Réponse de l\'API dates réservées:', response.data)
      return response.data.reservedDates || []
    } catch (error) {
      console.error('Erreur lors de la récupération des dates réservées:', error)
      return []
    }
  },
  
  /**
   * Créer une nouvelle réservation
   * @param {Object} reservationData Données de la réservation
   * @returns {Promise<Object>} Réservation créée
   */
  async createReservation(reservationData) {
    const authStore = useAuthStore()
    
    // S'assurer que tous les champs requis sont présents
    const completeData = {
      ...reservationData,
      pickupLocation: reservationData.pickupLocation || 'Agence principale',
      returnLocation: reservationData.returnLocation || 'Agence principale',
      specialRequests: reservationData.specialRequests || ''
    }
    console.log('Données de réservation envoyées:', completeData)
    try {
      const response = await apiClient.post('/api/reservations', completeData, {
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error)
      throw error
    }
  },
  
  /**
   * Annuler une réservation
   * @param {number} reservationId ID de la réservation à annuler
   * @returns {Promise<Object>} Résultat de l'annulation
   */
  async cancelReservation(reservationId) {
    const authStore = useAuthStore()
    console.log('ID de la réservation à annuler:', reservationId)
    try {
      const response = await apiClient.delete(`/api/reservations/${reservationId}/cancel`, {
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      })
      
      return response.data
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la réservation:', error)
      throw error
    }
  },
  
  /**
   * Vérifier la disponibilité d'une voiture pour une période donnée
   * @param {number} carId ID de la voiture
   * @param {string} startDate Date de début (format YYYY-MM-DD)
   * @param {string} endDate Date de fin (format YYYY-MM-DD)
   * @returns {Promise<boolean>} Disponibilité de la voiture
   */
  async checkCarAvailability(carId, startDate, endDate) {
    try {
      const response = await apiClient.get(`/api/cars/${carId}/availability`, {
        params: {
          startDate,
          endDate
        }
      })
      
      return response.data.available
    } catch (error) {
      console.error('Erreur lors de la vérification de disponibilité:', error)
      throw error
    }
  }
}
