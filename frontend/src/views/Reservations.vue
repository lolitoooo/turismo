<template>
  <div class="reservations-page">
    <div class="container">
      <h1 class="page-title">Mes réservations</h1>
      
      <!-- Affichage du chargement -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>Chargement de vos réservations...</p>
      </div>
      
      <!-- Affichage des erreurs -->
      <div v-else-if="error" class="error-container">
        <div class="error-message">
          <h2>Erreur</h2>
          <p>{{ error }}</p>
        </div>
      </div>
      
      <!-- Aucune réservation -->
      <div v-else-if="reservations.length === 0" class="no-reservations">
        <p>Vous n'avez aucune réservation pour le moment.</p>
        <router-link to="/cars" class="btn-primary">Découvrir nos véhicules</router-link>
      </div>
      
      <!-- Liste des réservations -->
      <div v-else class="reservations-list">
        <div v-for="reservation in reservations" :key="reservation.id" class="reservation-card">
          <div class="reservation-header">
            <h3>{{ reservation.car?.brand }} {{ reservation.car?.model }}</h3>
            <div class="reservation-status" :class="getStatusClass(reservation.status)">
              {{ getStatusLabel(reservation.status) }}
            </div>
          </div>
          
          <div class="reservation-details">
            <div class="reservation-image">
              <img :src="getReservationImage(reservation)" :alt="reservation.car?.model || 'Voiture'">
            </div>
            
            <div class="reservation-info">
              <div class="info-group">
                <div class="info-label">Dates</div>
                <div class="info-value">{{ formatDate(reservation.startDate) }} - {{ formatDate(reservation.endDate) }}</div>
              </div>
              
              <div class="info-group">
                <div class="info-label">Durée</div>
                <div class="info-value">{{ calculateDuration(reservation.startDate, reservation.endDate) }} jours</div>
              </div>
              
              <div class="info-group">
                <div class="info-label">Prise en charge</div>
                <div class="info-value">{{ reservation.pickupLocation }}</div>
              </div>
              
              <div class="info-group">
                <div class="info-label">Retour</div>
                <div class="info-value">{{ reservation.returnLocation }}</div>
              </div>
              
              <div class="info-group" v-if="reservation.specialRequests">
                <div class="info-label">Demandes spéciales</div>
                <div class="info-value">{{ reservation.specialRequests }}</div>
              </div>
            </div>
          </div>
          
          <div class="reservation-actions">
            <button 
              @click="cancelReservation(reservation.id)" 
              class="btn-cancel"
              :disabled="cancellationLoading === reservation.id"
            >
              {{ cancellationLoading === reservation.id ? 'Annulation en cours...' : 'Annuler la réservation' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import reservationService from '@/services/reservationService'
import { getCarImage } from '@/services/carService'

export default {
  name: 'Reservations',
  setup() {
    const reservations = ref([])
    const loading = ref(true)
    const error = ref(null)
    const cancellationLoading = ref(null)
    
    // Charger les réservations de l'utilisateur
    const loadReservations = async () => {
      try {
        loading.value = true
        error.value = null
        
        const userReservations = await reservationService.getUserReservations()
        reservations.value = userReservations
        
      } catch (err) {
        console.error('Erreur lors du chargement des réservations:', err)
        error.value = 'Une erreur est survenue lors du chargement de vos réservations.'
      } finally {
        loading.value = false
      }
    }
    
    // Formater une date pour l'affichage
    const formatDate = (dateString) => {
      if (!dateString) return 'Date inconnue'
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    }
    
    // Récupérer l'image d'une réservation de manière sécurisée
    const getReservationImage = (reservation) => {
      if (!reservation || !reservation.car) {
        return '/img/car-placeholder.jpg'
      }
      
      try {
        // Utiliser l'image de la voiture si disponible
        if (reservation.car.image) {
          return reservation.car.image
        }
        
        // Sinon construire le nom de l'image selon la convention
        const brand = reservation.car.brand?.toLowerCase() || ''
        const model = reservation.car.model?.replace(/\s+/g, '_').toLowerCase() || ''
        
        if (brand && model) {
          return require(`@/assets/images/${brand}_${model}_home.webp`)
        } else {
          return '/img/car-placeholder.jpg'
        }
      } catch (error) {
        console.warn(`Image non trouvée pour la réservation`, error)
        return '/img/car-placeholder.jpg'
      }
    }
    
    // Calculer la durée entre deux dates en jours
    const calculateDuration = (startDate, endDate) => {
      if (!startDate || !endDate) return 0
      
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      return diffDays
    }
    
    // Obtenir la classe CSS en fonction du statut
    const getStatusClass = (status) => {
      switch (status) {
        case 'confirmed':
          return 'status-confirmed'
        case 'cancelled':
          return 'status-cancelled'
        case 'completed':
          return 'status-completed'
        default:
          return ''
      }
    }
    
    // Obtenir le libellé du statut
    const getStatusLabel = (status) => {
      switch (status) {
        case 'confirmed':
          return 'Confirmée'
        case 'cancelled':
          return 'Annulée'
        case 'completed':
          return 'Terminée'
        default:
          return status
      }
    }
    
    // Vérifier si une réservation peut être annulée
    const canCancel = (reservation) => {
      return reservation.status === 'confirmed'
    }
    
    // Annuler une réservation
    const cancelReservation = async (reservationId) => {
      try {
        cancellationLoading.value = reservationId
        await reservationService.cancelReservation(reservationId)
        
        // Recharger les réservations pour mettre à jour la liste
        await loadReservations()
      } catch (err) {
        console.error('Erreur lors de l\'annulation de la réservation:', err)
        error.value = 'Une erreur est survenue lors de l\'annulation de la réservation.'
      } finally {
        cancellationLoading.value = null
      }
    }
    
    onMounted(() => {
      loadReservations()
    })
    
    return {
      reservations,
      loading,
      error,
      cancellationLoading,
      formatDate,
      calculateDuration,
      getStatusClass,
      getStatusLabel,
      canCancel,
      cancelReservation,
      getReservationImage
    }
  }
}
</script>

<style scoped>
.reservations-page {
  padding: 2rem 0;
}

.page-title {
  margin-bottom: 2rem;
  font-size: 2rem;
  color: var(--primary-color);
}

.loading-container, .error-container, .no-reservations {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: var(--error-color);
  max-width: 500px;
}

.no-reservations {
  color: #666;
}

.btn-primary {
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  margin-top: 1rem;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: var(--primary-dark-color);
}

.reservations-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.reservation-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.reservation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #f8f8f8;
  border-bottom: 1px solid #eee;
}

.reservation-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-color);
}

.reservation-status {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-confirmed {
  background-color: #e3f2fd;
  color: #0d47a1;
}

.status-cancelled {
  background-color: #ffebee;
  color: #b71c1c;
}

.status-completed {
  background-color: #e8f5e9;
  color: #1b5e20;
}

.reservation-details {
  display: flex;
  padding: 1rem;
}

.reservation-image {
  width: 150px;
  height: 100px;
  overflow: hidden;
  border-radius: 4px;
  margin-right: 1.5rem;
}

.reservation-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reservation-info {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.info-group {
  margin-bottom: 0.5rem;
}

.info-label {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.info-value {
  font-weight: 500;
  color: var(--text-color);
}

.reservation-actions {
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.btn-cancel {
  background-color: transparent;
  color: var(--error-color);
  border: 1px solid var(--error-color);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel:hover {
  background-color: var(--error-color);
  color: black;
}

.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .reservation-details {
    flex-direction: column;
  }
  
  .reservation-image {
    width: 100%;
    height: 150px;
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .reservation-info {
    grid-template-columns: 1fr;
  }
}
</style>
