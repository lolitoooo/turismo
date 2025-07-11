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
    <template v-else>
      <section class="car-hero" :style="{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${car.heroImage})` }">
        <div class="container">
          <h1>{{ car.name || `${car.brand} ${car.model}` }}</h1>
          <div class="car-category">{{ car.brand }} | {{ car.type }}</div>
        </div>
      </section>
    </template>
    
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
              <p class="availability-note">Un calendrier de réservation sera bientôt disponible.</p>
            </div>
            
            <div class="car-actions">
              <button 
                class="btn-reserve" 
                :disabled="!car.available || !hasSubscription" 
                @click="redirectToCars"
              >
                {{ hasSubscription ? 'Réserver maintenant' : 'Abonnement requis' }}
              </button>
              <p v-if="!hasSubscription" class="subscription-required">
                Un abonnement est nécessaire pour réserver ce véhicule. 
                <router-link to="/subscriptions" class="subscription-link">Voir les abonnements</router-link>
              </p>
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
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCarById } from '@/services/carService'
import { hasActiveSubscription, getActiveSubscription } from '@/services/subscriptionService'

export default {
  name: 'CarDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const carId = computed(() => parseInt(route.params.id))
    const car = ref({})
    const loading = ref(true)
    const error = ref(null)
    const hasSubscription = ref(false)
    
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
        
        // Vérifier si l'utilisateur a un abonnement actif
        hasSubscription.value = hasActiveSubscription()
        
        // Si l'utilisateur a un abonnement, vérifier s'il peut accéder à cette catégorie de véhicule
        if (hasSubscription.value) {
          const activeSubscription = getActiveSubscription()
          if (activeSubscription && car.value.category) {
            // Vérifier si le niveau d'abonnement permet d'accéder à cette catégorie
            hasSubscription.value = activeSubscription.level >= car.value.category
          }
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err)
        error.value = 'Erreur lors du chargement des données'
      } finally {
        loading.value = false
      }
    }
    
    // Fonction pour rediriger vers la page des voitures
    const redirectToCars = () => {
      router.push('/cars')
    }
    
    onMounted(() => {
      loadCarData()
    })
    
    return {
      car,
      loading,
      error,
      hasSubscription,
      redirectToCars
    }
  }
}
</script>

<style lang="scss" scoped>
.car-detail-page {
  min-height: 100vh;
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
