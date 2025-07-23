<template>
  <div class="cars-page">
    <section class="hero-section">
      <div class="hero-content">
        <h1>Nos Véhicules</h1>
        <p>Découvrez notre sélection de véhicules de luxe et de sport</p>
      </div>
    </section>
    
    <section class="cars-section">
      <div class="container">
        <!-- Affichage du chargement -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Chargement des véhicules...</p>
        </div>
        
        <!-- Affichage des erreurs -->
        <div v-else-if="error" class="error-container">
          <div class="error-message">
            <h2>Erreur</h2>
            <p>{{ error }}</p>
            <button @click="loadCars()" class="btn-retry">Réessayer</button>
          </div>
        </div>
        
        <!-- Affichage du contenu principal -->
        <div v-else>
          <div class="filters">
            <div class="filter-group">
              <h3>Filtrer par</h3>
              <div class="filter-tabs">
                <button 
                  v-for="tab in ['category', 'type', 'brand', 'engine']" 
                  :key="tab" 
                  :class="['filter-tab', { active: activeTab === tab }]"
                  @click="activeTab = tab"
                >
                  {{ tabLabels[tab] }}
                </button>
              </div>
            </div>
          
          <div class="categories">
            <button 
              class="category-btn" 
              :class="{ active: selectedCategory === 'all' }"
              @click="handleCategoryChange('all')"
            >
              Tous
            </button>
            
            <template v-if="activeTab === 'category'">
              <button 
                v-for="category in categories" 
                :key="category.id" 
                class="category-btn"
                :class="{ active: selectedCategory === category.id.toString() }"
                @click="handleCategoryChange(category.id.toString())"
              >
                Catégorie {{ category.id }}
              </button>
            </template>

            <template v-else-if="activeTab === 'type'">
              <button 
                v-for="type in uniqueTypes" 
                :key="type" 
                class="category-btn"
                :class="{ active: selectedCategory === type }"
                @click="handleCategoryChange(type)"
              >
                {{ type }}
              </button>
            </template>
            
            <template v-else-if="activeTab === 'brand'">
              <button 
                v-for="brand in uniqueBrands" 
                :key="brand" 
                class="category-btn"
                :class="{ active: selectedCategory === brand }"
                @click="handleCategoryChange(brand)"
              >
                {{ brand }}
              </button>
            </template>
            
            <template v-else-if="activeTab === 'engine'">
              <button 
                v-for="engine in uniqueEngines" 
                :key="engine" 
                class="category-btn"
                :class="{ active: selectedCategory === engine }"
                @click="handleCategoryChange(engine)"
              >
                {{ engine }}
              </button>
            </template>
          </div>
        </div>
        
        <div v-if="hasCars" class="cars-grid">
          <div v-for="car in cars" :key="car.id" class="car-card">
            <div class="car-image">
              <img :src="car.image" :alt="car.name">
            </div>
            <div class="car-details">
              <div class="car-header">
                <h3 class="car-name">{{ car.name }}</h3>
              </div>
              <div class="car-info">
                <span class="car-type">{{ car.type }}</span>
                <span class="car-engine">{{ car.engine }}</span>
              </div>
              <button class="btn-reserve" @click="goToCarDetail(car.id)">Voir détails</button>
            </div>
          </div>
        </div>
        
        <div v-else class="no-cars">
          <p>Aucun véhicule ne correspond à votre recherche.</p>
        </div>
      </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAllCars, getUniqueTypes, getUniqueBrands, getUniqueEngines, getCarsByType, getCarsByBrand, getCarsByEngine } from '@/services/carService'
import { useSubscriptionStore } from '@/stores/subscription'

export default {
  name: 'CarsView',
  setup() {
    const router = useRouter()
    const subscriptionStore = useSubscriptionStore()
    const activeTab = ref('category')
    const selectedCategory = ref('all')
    const loading = ref(true)
    const error = ref(null)
    
    const tabLabels = {
      category: 'Catégorie',
      type: 'Type',
      brand: 'Marque',
      engine: 'Motorisation'
    }
    
    const cars = ref([])
    // Récupérer les catégories depuis le store de souscription
    const categories = computed(() => {
      // Si les abonnements sont chargés dans le store, on les utilise
      if (subscriptionStore.subscriptions && subscriptionStore.subscriptions.length > 0) {
        return subscriptionStore.subscriptions.map(sub => ({
          id: sub.id || (sub.subscriptionType ? sub.subscriptionType.id : null),
          name: sub.name || (sub.subscriptionType ? sub.subscriptionType.name : 'Inconnu')
        }));
      }
      // Sinon, on utilise des valeurs par défaut
      return [
        { id: 1, name: 'Starter' },
        { id: 2, name: 'Urban' },
        { id: 3, name: 'Executive' },
        { id: 4, name: 'Prestige' },
        { id: 5, name: 'Elite' },
        { id: 6, name: 'Signature' }
      ];
    })
    const uniqueTypesData = ref([])
    const uniqueBrandsData = ref([])
    const uniqueEnginesData = ref([])
    
    // Filtrer les voitures en fonction du niveau d'abonnement de l'utilisateur
    const filterCarsBySubscriptionLevel = (carsToFilter) => {
      // Récupérer le niveau maximum de catégorie accessible
      const maxLevel = subscriptionStore.hasActiveSubscription ? subscriptionStore.maxCarCategoryLevel : 0
      console.log(subscriptionStore.value)
      // Si maxLevel est 0 (pas d'abonnement ou erreur), afficher toutes les voitures
      if (maxLevel === 0) {
        console.log('Aucun abonnement actif ou erreur de chargement, affichage de toutes les voitures')
        return carsToFilter
      }
      
      // Filtrer pour ne garder que les voitures accessibles selon le niveau d'abonnement
      return carsToFilter.filter(car => {
        // Vérifier si la voiture est accessible avec l'abonnement actuel
        if (car.category && car.category.id) {
          // Une voiture est accessible si son niveau de catégorie est inférieur ou égal au niveau d'abonnement
          return car.category.id <= maxLevel;
        }
        return false; // Si pas de catégorie définie, la voiture n'est pas accessible
      })
    }
    
    // Charger les données des voitures depuis l'API
    const loadCars = async () => {
      loading.value = true
      error.value = null
      
      try {
        // Charger les abonnements depuis le store
        await subscriptionStore.fetchSubscriptions()
        
        // Charger toutes les voitures
        const allCars = await getAllCars()
        
        // Appliquer le filtre d'abonnement
        cars.value = filterCarsBySubscriptionLevel(allCars)
        
        // Charger les données uniques pour les filtres
        uniqueTypesData.value = await getUniqueTypes()
        uniqueBrandsData.value = await getUniqueBrands()
        uniqueEnginesData.value = await getUniqueEngines()
        
        loading.value = false
      } catch (err) {
        console.error('Erreur lors du chargement des voitures:', err)
        error.value = 'Erreur lors du chargement des voitures. Veuillez réessayer.'
        loading.value = false
      }
    }
    
    // Charger les voitures filtrées en fonction de la catégorie sélectionnée
    const loadFilteredCars = async () => {
      if (selectedCategory.value === 'all') {
        // Si 'Tous' est sélectionné, on charge toutes les voitures
        await loadCars()
        return
      }
      
      loading.value = true
      error.value = null
      
      try {
        let filteredCars = []
        
        // Charger les voitures filtrées en fonction de l'onglet actif
        if (activeTab.value === 'category') {
          // Charger toutes les voitures puis filtrer par catégorie
          const allCars = await getAllCars()
          const categoryId = parseInt(selectedCategory.value)
          filteredCars = allCars.filter(car => car.category && car.category.id === categoryId)
        } else if (activeTab.value === 'type') {
          filteredCars = await getCarsByType(selectedCategory.value)
        } else if (activeTab.value === 'brand') {
          filteredCars = await getCarsByBrand(selectedCategory.value)
        } else if (activeTab.value === 'engine') {
          filteredCars = await getCarsByEngine(selectedCategory.value)
        }
        
        // Appliquer le filtre d'abonnement
        cars.value = filterCarsBySubscriptionLevel(filteredCars)
        
        loading.value = false
      } catch (err) {
        console.error('Erreur lors du chargement des voitures filtrées:', err)
        error.value = 'Une erreur est survenue lors du filtrage des données'
        loading.value = false
      }
    }
    
    // Observer les changements de catégorie et d'onglet pour recharger les données
    const handleCategoryChange = async (category) => {
      selectedCategory.value = category
      await loadFilteredCars()
    }
    
    // Rediriger vers la page de détail de la voiture
    const goToCarDetail = (carId) => {
      router.push(`/cars/${carId}`)
    }
    
    // Calculer s'il y a des voitures à afficher
    const hasCars = computed(() => {
      return cars.value && cars.value.length > 0
    })
    
    // Charger les données au montage du composant
    onMounted(async () => {
      // Récupérer l'abonnement actif de l'utilisateur si nécessaire
      if (!subscriptionStore.activeSubscription) {
        try {
          await subscriptionStore.fetchActiveSubscription()
        } catch (err) {
          console.error('Erreur lors de la récupération de l\'abonnement actif:', err)
        }
      }
      
      // Charger les voitures filtrées par abonnement
      loadCars()
    })
    
    return {
      activeTab,
      selectedCategory,
      tabLabels,
      cars,
      categories,
      uniqueTypes: uniqueTypesData,
      uniqueBrands: uniqueBrandsData,
      uniqueEngines: uniqueEnginesData,
      loading,
      error,
      hasCars,
      handleCategoryChange,
      goToCarDetail
    }
  }
}
</script>

<style lang="scss" scoped>
.cars-page {
  min-height: 100vh;
}

.hero-section {
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('@/assets/images/porsche_home.jpg');
  background-size: cover;
  background-position: center;
  height: 40vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  
  .hero-content {
    max-width: 800px;
    padding: 0 2rem;
    
    h1 {
      font-family: 'Playfair Display', serif;
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: white;
    }
    
    p {
      font-size: 1.2rem;
      opacity: 0.9;
    }
  }
}

.cars-section {
  padding: 4rem 0;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  
  .filters {
    margin-bottom: 3rem;
    
    .filter-group {
      margin-bottom: 2rem;
      
      h3 {
        font-size: 1.2rem;
        margin-bottom: 1rem;
        font-weight: 600;
      }
    }
    
    .filter-tabs {
      display: flex;
      gap: 1rem;
      
      .filter-tab {
        padding: 0.75rem 1.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: none;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s;
        
        &:hover {
          border-color: #aaa;
        }
        
        &.active {
          background-color: #1a1a1a;
          color: white;
          border-color: #1a1a1a;
        }
      }
    }
    
    .categories {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 1.5rem;
      
      .category-btn {
        padding: 0.5rem 1rem;
        border: 1px solid #ddd;
        border-radius: 30px;
        background: none;
        cursor: pointer;
        font-size: 0.9rem;
        transition: all 0.3s;
        
        &:hover {
          border-color: #aaa;
        }
        
        &.active {
          background-color: #1a1a1a;
          color: white;
          border-color: #1a1a1a;
        }
      }
    }
  }
  
  .cars-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
    
    .car-card {
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      transition: transform 0.3s, box-shadow 0.3s;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      }
      
      .car-image {
        height: 200px;
        overflow: hidden;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s;
        }
      }
      
      .car-details {
        padding: 1.5rem;
        
        .car-name {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }
        
        .car-info {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          
          span {
            font-size: 0.9rem;
            color: #666;
            display: flex;
            align-items: center;
            
            &::before {
              content: '';
              display: inline-block;
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background-color: #1a1a1a;
              margin-right: 0.5rem;
            }
          }
        }
        
        /* Styles de prix supprimés */
        
        .btn-reserve {
          width: 100%;
          padding: 0.75rem;
          background-color: #1a1a1a;
          color: white;
          border: none;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s;
          
          &:hover {
            background-color: #333;
          }
        }
      }
    }
  }
  
  .no-cars {
    text-align: center;
    padding: 3rem 0;
    
    p {
      font-size: 1.1rem;
      color: #666;
    }
  }
  
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 0;
    
    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top-color: #1a1a1a;
      animation: spin 1s ease-in-out infinite;
      margin-bottom: 1rem;
    }
    
    p {
      font-size: 1.1rem;
      color: #666;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  }
  
  .error-container {
    display: flex;
    justify-content: center;
    padding: 3rem 0;
    
    .error-message {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      padding: 2rem;
      text-align: center;
      max-width: 500px;
      
      h2 {
        color: #e74c3c;
        margin-bottom: 1rem;
      }
      
      p {
        margin-bottom: 1.5rem;
        color: #666;
      }
      
      .btn-retry {
        padding: 0.75rem 1.5rem;
        background-color: #1a1a1a;
        color: white;
        border: none;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.3s;
        
        &:hover {
          background-color: #333;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .hero-section {
    height: 30vh;
    
    .hero-content {
      h1 {
        font-size: 2.5rem;
      }
    }
  }
  
  .filters {
    .filter-tabs {
      overflow-x: auto;
      padding-bottom: 0.5rem;
      
      .filter-tab {
        flex: 0 0 auto;
      }
    }
  }
}
</style>
