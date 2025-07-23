<template>
  <div class="car-detail-page">
    <!-- Affichage du chargement -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Chargement des informations du véhicule...</p>
    </div>
    
    <!-- Affichage des erreurs -->
    <div v-else-if="error" class="error-container">
      <div class="error-message">
        <h2>Erreur</h2>
        <p>{{ error }}</p>
        <button @click="$router.push('/cars')" class="btn-back">Retour à la liste des véhicules</button>
      </div>
    </div>
    
    <!-- Affichage des détails de la voiture -->
    <div v-else>
      <section class="car-hero" :style="{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${car.heroImage})` }">
        <div class="container">
          <h1>{{ car.name || `${car.brand} ${car.model}` }}</h1>
          <div class="car-category">{{ car.brand }} | {{ car.type }}</div>
        </div>
      </section>
      
      <section class="car-content">
        <div class="container">
        <div class="car-grid">
          <div class="car-gallery">
            <div class="main-image">
              <img :src="car.image" :alt="car.name">
            </div>
          </div>
          
          <div class="car-info">
            <div class="car-header">
              <h2>{{ car.name || `${car.brand} ${car.model}` }}</h2>
            </div>
            
            <div class="car-specs">
              <div class="spec-item">
                <div class="spec-label">Marque</div>
                <div class="spec-value">{{ car.brand }}</div>
              </div>
              <div class="spec-item">
                <div class="spec-label">Modèle</div>
                <div class="spec-value">{{ car.model }}</div>
              </div>
              <div class="spec-item">
                <div class="spec-label">Année</div>
                <div class="spec-value">{{ car.year }}</div>
              </div>
              <div class="spec-item">
                <div class="spec-label">Couleur</div>
                <div class="spec-value">{{ car.color }}</div>
              </div>
              <div class="spec-item">
                <div class="spec-label">Kilométrage</div>
                <div class="spec-value">{{ car.mileage }} km</div>
              </div>
              <div class="spec-item">
                <div class="spec-label">Transmission</div>
                <div class="spec-value">{{ car.transmission }}</div>
              </div>
              <div class="spec-item">
                <div class="spec-label">Carburant</div>
                <div class="spec-value">{{ car.fuel }}</div>
              </div>
              <div class="spec-item">
                <div class="spec-label">Type</div>
                <div class="spec-value">{{ car.type }}</div>
              </div>
            </div>
            
            <div class="car-availability">
              <h3>Disponibilité</h3>
              <div class="availability-status" :class="{ available: car.available, unavailable: !car.available }">
                {{ car.available ? 'Disponible' : 'Indisponible' }}
              </div>
              
              <div v-if="car.available && hasSubscription" class="reservation-calendar">
                <h4>Sélectionner les dates de réservation <span class="required">*</span></h4>
                <Datepicker v-model="dateRange" range :min-date="new Date()" :disabled-dates="disabledDates" :format="formatDate" :enable-time-picker="false" placeholder="Sélectionner les dates" class="custom-datepicker" required />
                <div v-if="validationErrors.dateRange" class="error-message">{{ validationErrors.dateRange }}</div>
                <div class="reservation-info" v-if="dateRange && dateRange.length === 2">
                  <p><strong>Début:</strong> {{ formatDisplayDate(dateRange[0]) }}</p>
                  <p><strong>Fin:</strong> {{ formatDisplayDate(dateRange[1]) }}</p>
                  <p><strong>Durée:</strong> {{ calculateDuration }} jours</p>
                </div>
                
                <div class="reservation-details" v-if="dateRange && dateRange.length === 2">
                  <h4>Détails de la réservation</h4>
                  
                  <div class="form-group">
                    <label for="pickupLocation">Lieu de prise en charge <span class="required">*</span></label>
                    <select id="pickupLocation" v-model="pickupLocation" class="form-control" required>
                      <option value="">Sélectionnez un lieu</option>
                      <option value="Agence principale">Agence principale</option>
                      <option value="Aéroport">Aéroport</option>
                      <option value="Gare">Gare</option>
                      <option value="Hôtel">Hôtel</option>
                    </select>
                    <div v-if="validationErrors.pickupLocation" class="error-message">{{ validationErrors.pickupLocation }}</div>
                  </div>
                  
                  <div class="form-group">
                    <label for="returnLocation">Lieu de retour <span class="required">*</span></label>
                    <select id="returnLocation" v-model="returnLocation" class="form-control" required>
                      <option value="">Sélectionnez un lieu</option>
                      <option value="Agence principale">Agence principale</option>
                      <option value="Aéroport">Aéroport</option>
                      <option value="Gare">Gare</option>
                      <option value="Hôtel">Hôtel</option>
                    </select>
                    <div v-if="validationErrors.returnLocation" class="error-message">{{ validationErrors.returnLocation }}</div>
                  </div>
                  
                  <div class="form-group">
                    <label for="specialRequests">Demandes spéciales</label>
                    <textarea id="specialRequests" v-model="specialRequests" class="form-control" placeholder="Indiquez ici vos demandes spéciales (optionnel)"></textarea>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="car-actions">
              <button 
                v-if="car.available && hasSubscription && !reservationSuccess" 
                @click="createReservation" 
                :disabled="!canReserve || reservationLoading" 
                class="btn-reserve"
              >
                {{ reservationLoading ? 'Réservation en cours...' : 'Réserver maintenant' }}
              </button>
              
              <p v-if="!hasSubscription" class="subscription-required">
                Un abonnement est nécessaire pour réserver ce véhicule. 
                <router-link to="/subscriptions" class="subscription-link">Voir les abonnements</router-link>
              </p>
              
              <div v-if="reservationSuccess" class="reservation-success">
                <p>Réservation effectuée avec succès !</p>
                <p>Votre réservation a été enregistrée. Vous pouvez consulter les détails dans votre profil.</p>
                <div class="reservation-actions">
                  <button @click="$router.push('/reservations')" class="btn-outline-primary">Voir mes réservations</button>
                  <button @click="reservationSuccess = false; dateRange = null" class="btn-outline-secondary">Nouvelle réservation</button>
                </div>
              </div>
              
              <div v-if="reservationError" class="reservation-error">
                <p>{{ reservationError }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="car-description">
          <h3>Description</h3>
          <p>{{ car.description }}</p>
        </div>
        
        <div class="car-features">
          <h3>Caractéristiques</h3>
          <ul class="features-list">
            <li v-for="(feature, index) in car.features" :key="index">
              <i class="pi pi-check"></i> {{ feature }}
            </li>
          </ul>
        </div>
      </div>
    </section>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCarById } from '@/services/carService'
import { useSubscriptionStore } from '@/stores/subscription'
import reservationService from '@/services/reservationService'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'

export default {
  name: 'CarDetail',
  components: {
    Datepicker
  },
  setup() {
    const route = useRoute()
    const router = useRouter()
    const carId = computed(() => parseInt(route.params.id))
    const car = ref({})
    const loading = ref(true)
    const error = ref(null)
    const hasSubscription = ref(false)
    const dateRange = ref(null)
    const disabledDates = ref([])
    const reservationSuccess = ref(false)
    const reservationError = ref(null)
    const reservationLoading = ref(false)
    const pickupLocation = ref('')
    const returnLocation = ref('')
    const specialRequests = ref('')
    const reservationId = ref(null)
    const validationErrors = ref({
      dateRange: '',
      pickupLocation: '',
      returnLocation: ''
    })
    
    // Fonction pour charger les données de la voiture
    const loadCarData = async () => {
      try {
        const id = route.params.id
        const carData = await getCarById(id)
        
        if (!carData) {
          error.value = 'Voiture non trouvée'
          return
        }
        
        car.value = carData
        console.log('Données de la voiture chargées:', car.value)
        console.log('Voiture disponible:', car.value.available)
        
        // Utiliser le store d'abonnement pour vérifier l'abonnement actif
        const subscriptionStore = useSubscriptionStore()
        await subscriptionStore.fetchActiveSubscription()
        
        // Vérifier si l'utilisateur a un abonnement actif
        hasSubscription.value = subscriptionStore.hasActiveSubscription
        console.log('Utilisateur a un abonnement actif:', hasSubscription.value)
        
        // Si l'utilisateur a un abonnement, vérifier s'il peut accéder à cette catégorie de véhicule
        if (hasSubscription.value && car.value.category) {
          // Vérifier si le niveau d'abonnement permet d'accéder à cette catégorie
          const maxLevel = hasSubscription.value.id
          console.log('Niveau max de catégorie accessible:', maxLevel)
          console.log('Catégorie de la voiture:', car.value.category.id)
          hasSubscription.value = maxLevel >= car.value.category.id
          console.log('Accès autorisé à cette catégorie:', hasSubscription.value)
        }
        
        // Charger les dates indisponibles pour cette voiture
        loadDisabledDates()
        
        // Vérifier si le calendrier devrait s'afficher
        console.log('Conditions d\'affichage du calendrier:', car.value.available, hasSubscription.value)
        console.log('Le calendrier devrait s\'afficher:', car.value.available && hasSubscription.value)
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err)
        error.value = 'Erreur lors du chargement des données'
      } finally {
        loading.value = false
      }
    }
    
    // Fonction pour charger les dates indisponibles
    const loadDisabledDates = async () => {
      try {
        if (!car.value || !car.value.id) return
        
        // Récupérer les dates réservées depuis l'API
        const reservedPeriods = await reservationService.getReservedDatesForCar(car.value.id)
        console.log('Périodes réservées récupérées:', reservedPeriods)
        
        // Transformer les périodes en dates individuelles désactivées
        const disabledDatesList = []
        
        reservedPeriods.forEach(period => {
          const startDate = new Date(period.start)
          const endDate = new Date(period.end)
          
          // Ajouter toutes les dates entre start et end (incluses)
          const currentDate = new Date(startDate)
          while (currentDate <= endDate) {
            disabledDatesList.push(new Date(currentDate))
            currentDate.setDate(currentDate.getDate() + 1)
          }
        })
        
        disabledDates.value = disabledDatesList
        console.log('Dates désactivées:', disabledDates.value)
      } catch (err) {
        console.error('Erreur lors du chargement des dates indisponibles:', err)
      }
    }
    
    // Fonction pour formater la date pour l'affichage
    const formatDisplayDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
    
    // Fonction pour formater la date pour l'affichage dans le datepicker
    const formatDate = (date) => {
      if (!date) return ''
      // Vérifier si la date est valide
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        console.error('Date invalide:', date)
        return ''
      }
      // Format français JJ/MM/AAAA
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    }
    
    // Calculer la durée de la réservation en jours
    const calculateDuration = computed(() => {
      if (!dateRange.value || dateRange.value.length !== 2) return 0
      
      const start = new Date(dateRange.value[0])
      const end = new Date(dateRange.value[1])
      const diffTime = Math.abs(end - start)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      return diffDays
    })
    
    // Vérifier si l'utilisateur peut réserver
    const canReserve = computed(() => {
      return hasSubscription.value && car.value.available && dateRange.value && dateRange.value.length === 2
    })
    
    // Fonction pour valider le formulaire
    const validateForm = () => {
      // Réinitialiser les erreurs
      validationErrors.value = {
        dateRange: '',
        pickupLocation: '',
        returnLocation: ''
      }
      
      let isValid = true
      
      // Vérifier les dates
      if (!dateRange.value || dateRange.value.length !== 2) {
        validationErrors.value.dateRange = 'Veuillez sélectionner les dates de début et de fin de réservation'
        isValid = false
      }
      
      // Vérifier le lieu de prise en charge
      if (!pickupLocation.value) {
        validationErrors.value.pickupLocation = 'Veuillez sélectionner un lieu de prise en charge'
        isValid = false
      }
      
      // Vérifier le lieu de retour
      if (!returnLocation.value) {
        validationErrors.value.returnLocation = 'Veuillez sélectionner un lieu de retour'
        isValid = false
      }
      
      return isValid
    }
    
    // Fonction pour créer une réservation
    const createReservation = async () => {
      if (!canReserve.value) return
      
      // Valider le formulaire avant de soumettre
      if (!validateForm()) {
        reservationError.value = 'Veuillez remplir tous les champs obligatoires'
        return
      }
      
      reservationLoading.value = true
      reservationError.value = null
      reservationSuccess.value = false
      
      try {
        
        // Formater les dates pour l'API (format YYYY-MM-DD)
        const startDateFormatted = new Date(dateRange.value[0]).toISOString().split('T')[0]
        const endDateFormatted = new Date(dateRange.value[1]).toISOString().split('T')[0]
        console.log('Dates formatées:', startDateFormatted, endDateFormatted)
        const reservationData = {
          carId: car.value.id,
          startDate: startDateFormatted,
          endDate: endDateFormatted,
          pickupLocation: pickupLocation.value,
          returnLocation: returnLocation.value,
          specialRequests: specialRequests.value || ''
        }

        try {
          const result = await reservationService.createReservation(reservationData)
          console.log('Réponse de l\'API:', result)
        } catch (apiError) {
          console.error('Erreur d\'API détaillée:', apiError.response ? apiError.response.data : apiError)
          throw apiError
        }
        
        reservationSuccess.value = true
        dateRange.value = null
        pickupLocation.value = ''
        returnLocation.value = ''
        specialRequests.value = ''
        validationErrors.value = {
          dateRange: '',
          pickupLocation: '',
          returnLocation: ''
        }
      } catch (err) {
        console.error('Erreur lors de la création de la réservation:', err)
        reservationError.value = 'Une erreur est survenue lors de la création de la réservation. Veuillez réessayer.'
      } finally {
        reservationLoading.value = false
      }
    }
    
    onMounted(() => {
      loadCarData()
    })
    
    return {
      car,
      loading,
      error,
      hasSubscription,
      dateRange,
      disabledDates,
      reservationSuccess,
      reservationError,
      reservationLoading,
      pickupLocation,
      returnLocation,
      specialRequests,
      validationErrors,
      formatDisplayDate,
      formatDate,
      calculateDuration,
      canReserve,
      createReservation
    }
  }
}
</script>

<style lang="scss" scoped>
.car-detail-page {
  min-height: 100vh;
}

.required {
  color: #e74c3c;
  margin-left: 3px;
}

.error-message {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 5px;
  font-weight: 500;
}

.car-hero {
  height: 40vh;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  color: white;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
    
    h1 {
      font-family: 'Playfair Display', serif;
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: white;
    }
    
    .car-category {
      font-size: 1.2rem;
      opacity: 0.9;
    }
  }
}

.car-content {
  padding: 4rem 0;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  
  .car-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    margin-bottom: 3rem;
    
    @media (max-width: 992px) {
      grid-template-columns: 1fr;
    }
  }
  
  .car-gallery {
    .main-image {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      
      img {
        width: 100%;
        height: auto;
        display: block;
      }
    }
  }
  
  .car-info {
    .car-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      
      h2 {
        font-size: 2rem;
        font-weight: 600;
      }      
    }
    
    .car-specs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
      
      .spec-item {
        .spec-label {
          font-size: 0.9rem;
          color: #666;
          margin-bottom: 0.25rem;
        }
        
        .spec-value {
          font-size: 1.1rem;
          font-weight: 500;
        }
      }
    }
    
    .car-availability {
      margin-bottom: 2rem;
      
      h3 {
        font-size: 1.3rem;
        margin-bottom: 1rem;
      }
      
      .availability-status {
        display: inline-block;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-weight: 500;
        margin-bottom: 0.5rem;
        
        &.available {
          background-color: #e6f7e6;
          color: #2e7d32;
        }
        
        &.unavailable {
          background-color: #ffebee;
          color: #c62828;
        }
      }
      
      .availability-note {
        font-size: 0.9rem;
        color: #666;
      }
      
      .reservation-calendar {
        margin-top: 1.5rem;
        padding: 1rem;
        background-color: #f9f9f9;
        border-radius: 8px;
        
        h4 {
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }
        
        .custom-datepicker {
          width: 100%;
          margin-bottom: 1rem;
        }
        
        .reservation-info {
          margin-top: 1rem;
          padding: 1rem;
          background-color: #fff;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          
          p {
            margin-bottom: 0.5rem;
            font-size: 0.95rem;
            
            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
    }
    
    .car-actions {
      .btn-reserve {
        width: 100%;
        padding: 1rem;
        background-color: #1a1a1a;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1.1rem;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.3s;
        
        &:hover {
          background-color: #333;
        }
        
        &:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      }
      
      .subscription-required {
        margin-top: 1rem;
        font-size: 0.9rem;
        color: #e53935;
        text-align: center;
      }
      
      .subscription-link {
        color: #1a1a1a;
        font-weight: 500;
        text-decoration: underline;
        
        &:hover {
          color: #333;
        }
      }
      
      .reservation-success {
        margin-top: 1rem;
        padding: 1rem;
        background-color: #e6f7e6;
        color: #2e7d32;
        border-radius: 4px;
        text-align: center;
        
        p {
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        .reservation-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 1.5rem;
          
          button {
            padding: 0.75rem 1.25rem;
            border-radius: 4px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            border: none;
            
            &.btn-outline-primary {
              background-color: #2e7d32;
              color: white;
              
              &:hover {
                background-color: #1b5e20;
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              }
            }
            
            &.btn-outline-secondary {
              background-color: white;
              color: #2e7d32;
              border: 1px solid #2e7d32;
              
              &:hover {
                background-color: #f5f5f5;
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              }
            }
          }
        }
        
        .view-reservations-link {
          color: #2e7d32;
          font-weight: 500;
          text-decoration: underline;
          
          &:hover {
            color: #1b5e20;
          }
        }
      }
      
      .reservation-error {
        margin-top: 1rem;
        padding: 1rem;
        background-color: #ffebee;
        color: #c62828;
        border-radius: 4px;
        text-align: center;
        
        p {
          margin-bottom: 0;
          font-weight: 500;
        }
      }
    }
  }
  
  .car-description {
    margin-bottom: 3rem;
    
    h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
    
    p {
      line-height: 1.6;
      color: #444;
    }
  }
  
  .car-features {
    h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }
    
    .features-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
      list-style: none;
      padding: 0;
      
      li {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        i {
          color: #1a1a1a;
        }
      }
    }
  }
}
</style>
