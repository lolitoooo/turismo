<template>
  <div class="car-management">
    <div class="page-header">
      <h1>Gestion des Véhicules</h1>
      <div class="header-actions">
        <button class="btn-primary" @click="showAddCarModal = true">
          <i class="pi pi-plus"></i> Ajouter un véhicule
        </button>
      </div>
    </div>

    <div class="filters">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input 
          type="text" 
          v-model="filters.search" 
          placeholder="Rechercher par marque, modèle..." 
          @input="debounceSearch"
        />
      </div>
      <div class="filter-group">
        <label>Catégorie:</label>
        <select v-model="filters.category">
          <option value="">Toutes</option>
          <option v-for="category in carCategories.value" :key="category.id" :value="category.id">{{ category.name }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Disponibilité:</label>
        <select v-model="filters.available">
          <option value="">Toutes</option>
          <option value="true">Disponible</option>
          <option value="false">Non disponible</option>
        </select>
      </div>
      <button class="btn-secondary" @click="resetFilters">
        <i class="pi pi-filter-slash"></i> Réinitialiser
      </button>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button class="btn-primary" @click="fetchCars">Réessayer</button>
    </div>

    <div v-else class="cars-table-container">
      <table class="cars-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Marque</th>
            <th>Modèle</th>
            <th>Catégorie</th>
            <th>Disponible</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="car in filteredCars" :key="car.id">
            <td>{{ car.id }}</td>
            <td class="car-image-cell">
              <img :src="getCarImage(car)" alt="Car Image" class="car-thumbnail" />
            </td>
            <td>{{ car.brand }}</td>
            <td>{{ car.model }}</td>
            <td>{{ getCategoryType(car) }}</td>
            <td>
              <span class="status-badge" :class="car.available ? 'available' : 'unavailable'">
                {{ car.available ? 'Disponible' : 'Non disponible' }}
              </span>
            </td>
            <td class="actions">
              <button class="btn-icon" @click="editCar(car)">
                <i class="pi pi-pencil"></i>
              </button>
              <button class="btn-icon" @click="viewCarDetails(car)">
                <i class="pi pi-eye"></i>
              </button>
              <button class="btn-icon danger" @click="confirmDeleteCar(car)">
                <i class="pi pi-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="pagination">
        <button 
          class="btn-page" 
          :disabled="currentPage === 1" 
          @click="changePage(currentPage - 1)"
        >
          <i class="pi pi-chevron-left"></i>
        </button>
        <span class="page-info">
          Page {{ currentPage }} sur {{ totalPages }}
        </span>
        <button 
          class="btn-page" 
          :disabled="currentPage === totalPages" 
          @click="changePage(currentPage + 1)"
        >
          <i class="pi pi-chevron-right"></i>
        </button>
      </div>
    </div>
    
    <!-- Modal d'ajout de voiture -->
    <div v-if="showAddCarModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Ajouter un véhicule</h2>
          <button class="btn-close" @click="closeCarModal">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitCarForm">
            <div class="form-grid">
              <div class="form-group">
                <label for="brand">Marque*</label>
                <input id="brand" v-model="carForm.brand" type="text" required />
              </div>
              <div class="form-group">
                <label for="model">Modèle*</label>
                <input id="model" v-model="carForm.model" type="text" required />
              </div>
              <div class="form-group">
                <label for="year">Année*</label>
                <input id="year" v-model="carForm.year" type="number" required />
              </div>
              <div class="form-group">
                <label for="color">Couleur*</label>
                <input id="color" v-model="carForm.color" type="text" required />
              </div>
              <div class="form-group">
                <label for="licensePlate">Plaque d'immatriculation*</label>
                <input id="licensePlate" v-model="carForm.licensePlate" type="text" required />
              </div>
              <div class="form-group">
                <label for="mileage">Kilométrage*</label>
                <input id="mileage" v-model="carForm.mileage" type="number" required />
              </div>
              <div class="form-group">
                <label for="category">Catégorie*</label>
                <select id="category" v-model="carForm.category" required>
                  <option v-for="category in carCategories.value" :key="category.id" :value="category.id">{{ category.name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label for="seats">Places*</label>
                <input id="seats" v-model="carForm.seats" type="number" required />
              </div>
              <div class="form-group">
                <label for="transmission">Transmission*</label>
                <select id="transmission" v-model="carForm.transmission" required>
                  <option value="Automatique">Automatique</option>
                  <option value="Manuelle">Manuelle</option>
                </select>
              </div>
              <div class="form-group">
                <label for="fuelType">Carburant*</label>
                <select id="fuelType" v-model="carForm.fuelType" required>
                  <option value="Essence">Essence</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybride">Hybride</option>
                  <option value="Électrique">Électrique</option>
                </select>
              </div>
              <div class="form-group">
                <label for="available">Disponibilité</label>
                <select id="available" v-model="carForm.available">
                  <option :value="true">Disponible</option>
                  <option :value="false">Non disponible</option>
                </select>
              </div>
              <div class="form-group">
                <label for="features-doors">Portes</label>
                <input id="features-doors" v-model="carForm.features.doors" type="number" />
              </div>
              <div class="form-group">
                <label for="features-engine">Moteur</label>
                <input id="features-engine" v-model="carForm.features.engine" type="text" />
              </div>
              <div class="form-group">
                <label for="features-power">Puissance (ch)</label>
                <input id="features-power" v-model="carForm.features.power" type="number" />
              </div>

              <div class="form-group full-width">
                <label for="image">URL de l'image</label>
                <input id="image" v-model="carForm.image" type="text" />
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="closeCarModal">Annuler</button>
              <button type="submit" class="btn-primary">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal d'édition de voiture -->
    <div v-if="showEditCarModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Modifier le véhicule</h2>
          <button class="btn-close" @click="closeCarModal">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitCarForm">
            <div class="form-grid">
              <div class="form-group">
                <label for="edit-brand">Marque*</label>
                <input id="edit-brand" v-model="carForm.brand" type="text" required />
              </div>
              <div class="form-group">
                <label for="edit-model">Modèle*</label>
                <input id="edit-model" v-model="carForm.model" type="text" required />
              </div>
              <div class="form-group">
                <label for="edit-year">Année*</label>
                <input id="edit-year" v-model="carForm.year" type="number" required />
              </div>
              <div class="form-group">
                <label for="edit-color">Couleur*</label>
                <input id="edit-color" v-model="carForm.color" type="text" required />
              </div>
              <div class="form-group">
                <label for="edit-licensePlate">Plaque d'immatriculation*</label>
                <input id="edit-licensePlate" v-model="carForm.licensePlate" type="text" required />
              </div>
              <div class="form-group">
                <label for="edit-mileage">Kilométrage*</label>
                <input id="edit-mileage" v-model="carForm.mileage" type="number" required />
              </div>
              <div class="form-group">
                <label for="edit-category">Catégorie*</label>
                <select id="edit-category" v-model="carForm.category" required>
                  <option value="1">SUV Compact</option>
                  <option value="2">SUV</option>
                  <option value="3">SUV Premium</option>
                  <option value="4">Luxe</option>
                  <option value="5">Sport</option>
                  <option value="6">Supercar</option>
                </select>
              </div>
              <div class="form-group">
                <label for="edit-seats">Places*</label>
                <input id="edit-seats" v-model="carForm.seats" type="number" required />
              </div>
              <div class="form-group">
                <label for="edit-transmission">Transmission*</label>
                <select id="edit-transmission" v-model="carForm.transmission" required>
                  <option value="Automatique">Automatique</option>
                  <option value="Manuelle">Manuelle</option>
                </select>
              </div>
              <div class="form-group">
                <label for="edit-fuelType">Carburant*</label>
                <select id="edit-fuelType" v-model="carForm.fuelType" required>
                  <option value="Essence">Essence</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybride">Hybride</option>
                  <option value="Électrique">Électrique</option>
                </select>
              </div>
              <div class="form-group">
                <label for="edit-available">Disponibilité</label>
                <select id="edit-available" v-model="carForm.available">
                  <option :value="true">Disponible</option>
                  <option :value="false">Non disponible</option>
                </select>
              </div>
              <div class="form-group">
                <label for="edit-features-doors">Portes</label>
                <input id="edit-features-doors" v-model="carForm.features.doors" type="number" />
              </div>
              <div class="form-group">
                <label for="edit-features-engine">Moteur</label>
                <input id="edit-features-engine" v-model="carForm.features.engine" type="text" />
              </div>
              <div class="form-group">
                <label for="edit-features-power">Puissance (ch)</label>
                <input id="edit-features-power" v-model="carForm.features.power" type="number" />
              </div>

              <div class="form-group full-width">
                <label for="edit-image">URL de l'image</label>
                <input id="edit-image" v-model="carForm.image" type="text" />
              </div>
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="closeCarModal">Annuler</button>
              <button type="submit" class="btn-primary">Mettre à jour</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de détails de voiture -->
    <div v-if="showCarDetailsModal && selectedCar" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ selectedCar.brand }} {{ selectedCar.model }}</h2>
          <button class="btn-close" @click="showCarDetailsModal = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="car-details">
            <div class="car-details-image">
              <img :src="getCarImage(selectedCar)" :alt="`${selectedCar.brand} ${selectedCar.model}`" />
            </div>
            <div class="car-details-info">
              <div class="detail-row">
                <span class="detail-label">ID:</span>
                <span class="detail-value">{{ selectedCar.id }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Marque:</span>
                <span class="detail-value">{{ selectedCar.brand }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Modèle:</span>
                <span class="detail-value">{{ selectedCar.model }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Année:</span>
                <span class="detail-value">{{ selectedCar.year }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Couleur:</span>
                <span class="detail-value">{{ selectedCar.color }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Plaque:</span>
                <span class="detail-value">{{ selectedCar.licensePlate }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Kilométrage:</span>
                <span class="detail-value">{{ selectedCar.mileage }} km</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Catégorie:</span>
                <span class="detail-value">{{ getCategoryType(selectedCar) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Places:</span>
                <span class="detail-value">{{ selectedCar.seats }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Transmission:</span>
                <span class="detail-value">{{ selectedCar.transmission }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Carburant:</span>
                <span class="detail-value">{{ selectedCar.fuelType }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Disponibilité:</span>
                <span class="detail-value" :class="selectedCar.available ? 'available' : 'unavailable'">
                  {{ selectedCar.available ? 'Disponible' : 'Non disponible' }}
                </span>
              </div>
              <div class="detail-row full-width">
                <span class="detail-label">Description:</span>
                <p class="detail-value description">{{ selectedCar.description || 'Aucune description disponible' }}</p>
              </div>
              <div class="detail-row full-width" v-if="selectedCar.features">
                <span class="detail-label">Caractéristiques:</span>
                <div class="features-list">
                  <div v-if="selectedCar.features.seats" class="feature-item">
                    <span class="feature-label">Places:</span>
                    <span class="feature-value">{{ selectedCar.features.seats }}</span>
                  </div>
                  <div v-if="selectedCar.features.doors" class="feature-item">
                    <span class="feature-label">Portes:</span>
                    <span class="feature-value">{{ selectedCar.features.doors }}</span>
                  </div>
                  <div v-if="selectedCar.features.transmission" class="feature-item">
                    <span class="feature-label">Transmission:</span>
                    <span class="feature-value">{{ selectedCar.features.transmission }}</span>
                  </div>
                  <div v-if="selectedCar.features.engine" class="feature-item">
                    <span class="feature-label">Moteur:</span>
                    <span class="feature-value">{{ selectedCar.features.engine }}</span>
                  </div>
                  <div v-if="selectedCar.features.power" class="feature-item">
                    <span class="feature-label">Puissance:</span>
                    <span class="feature-value">{{ selectedCar.features.power }} ch</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn-secondary" @click="showCarDetailsModal = false">Fermer</button>
            <button class="btn-primary" @click="editCar(selectedCar); showCarDetailsModal = false">Modifier</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal && selectedCar" class="modal">
      <div class="modal-content modal-sm">
        <div class="modal-header">
          <h2>Confirmer la suppression</h2>
          <button class="btn-close" @click="showDeleteModal = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Êtes-vous sûr de vouloir supprimer le véhicule {{ selectedCar.brand }} {{ selectedCar.model }} ?</p>
          <div class="modal-actions">
            <button class="btn-secondary" @click="showDeleteModal = false">Annuler</button>
            <button class="btn-danger" @click="deleteCar">Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';

// Fonction de debounce pour la recherche
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const router = useRouter();
const authStore = useAuthStore();

// Vérifier si l'utilisateur est admin, sinon rediriger
if (!authStore.isAdmin) {
  router.push('/');
}

// État des voitures
const cars = ref([]);
const loading = ref(true);
const error = ref(null);
const currentPage = ref(1);
const totalPages = ref(1);
const itemsPerPage = ref(10);

// État des catégories de voitures
const carCategories = ref([]);
const categoryTypeMap = ref({
  1: 'SUV Compact',
  2: 'SUV',
  3: 'SUV Premium',
  4: 'Luxe',
  5: 'Sport',
  6: 'Supercar'
});

// Fonction pour récupérer les catégories de voitures depuis le backend
async function fetchCarCategories() {
  try {
    // Récupérer directement depuis /api/categories car /api/car-categories n'existe pas
    const response = await api.get('/api/categories');
    
    if (response && response.data && response.data.categories) {
      carCategories.value = response.data.categories;
      
      // Mettre à jour le mapping des catégories
      const newCategoryMap = {};
      carCategories.value.forEach(category => {
        newCategoryMap[category.id] = category.name;
      });
      categoryTypeMap.value = newCategoryMap;
      console.log('Catégories récupérées:', carCategories.value);
      console.log('Mapping des catégories:', categoryTypeMap.value);
    } else {
      console.warn('Aucune catégorie trouvée dans la réponse');
    }
  } catch (err) {
    console.error('Erreur lors de la récupération des catégories:', err);
    // En cas d'erreur, on garde le mapping statique par défaut
  }
}

// État des filtres
const filters = ref({
  search: '',
  category: '',
  type: '',
  available: ''
});

// État des modals
const showAddCarModal = ref(false);
const showEditCarModal = ref(false);
const showCarDetailsModal = ref(false);
const showDeleteModal = ref(false);
const selectedCar = ref(null);

// Formulaire de voiture
const carForm = ref({
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  color: 'Noir',
  licensePlate: '',
  mileage: 0,
  category: 1,
  type: '',
  dailyPrice: 0,  // Requis par le backend même si non affiché
  depositAmount: 0,
  includedKm: 0,
  extraKmPrice: 0,
  seats: 5,
  transmission: 'Automatique',
  fuelType: 'Essence',
  available: true,
  description: '',
  features: {
    seats: 5,
    doors: 5,
    transmission: 'Automatique',
    engine: 'Essence',
    power: 0
  },
  image: ''
});

// Récupérer les voitures
async function fetchCars() {
  loading.value = true;
  error.value = null;
  
  try {
    // Utiliser l'API standard des voitures avec le rôle admin
    const response = await api.get('/api/cars', {
      params: {
        page: currentPage.value,
        limit: itemsPerPage.value
      }
    });
    
    // Vérifier si la réponse contient un tableau de voitures ou un objet avec une propriété cars
    if (Array.isArray(response.data)) {
      cars.value = response.data;
      totalPages.value = Math.ceil(cars.value.length / itemsPerPage.value);
    } else if (response.data.cars) {
      cars.value = response.data.cars;
      totalPages.value = Math.ceil(response.data.total || cars.value.length / itemsPerPage.value);
    } else {
      cars.value = [];
      totalPages.value = 1;
    }
    
    console.log('Voitures récupérées:', cars.value);
  } catch (err) {
    error.value = 'Erreur lors de la récupération des véhicules';
    console.error('Erreur fetchCars:', err);
  } finally {
    loading.value = false;
  }
}

// Initialiser les données au chargement du composant
onMounted(async () => {
  // Récupérer les catégories de voitures d'abord
  await fetchCarCategories();
  // Puis récupérer les voitures
  await fetchCars();
});

// Filtrer les voitures
const filteredCars = computed(() => {
  // Filtrer d'abord
  const filtered = cars.value.filter(car => {
    // Filtre de recherche (insensible à la casse)
    const searchMatch = filters.value.search === '' || 
      (car.brand && car.brand.toLowerCase().includes(filters.value.search.toLowerCase())) ||
      (car.model && car.model.toLowerCase().includes(filters.value.search.toLowerCase()));
    
    // Filtre de catégorie (conversion en string pour comparaison)
    const categoryMatch = filters.value.category === '' || 
      (car.category !== undefined && car.category.toString() === filters.value.category);
    
    // Filtre de type (vérifier le type direct ou le type dérivé de la catégorie)
    const typeMatch = filters.value.type === '' || 
      (car.type && car.type.toLowerCase() === filters.value.type.toLowerCase()) ||
      (car.category && getCategoryType(car.category) === filters.value.type);
    
    // Filtre de disponibilité
    const availableMatch = filters.value.available === '' || 
      (filters.value.available === 'true' && car.available === true) ||
      (filters.value.available === 'false' && car.available === false);
    
    return searchMatch && categoryMatch && typeMatch && availableMatch;
  });
  
  // Puis trier par ID par défaut (ordre croissant)
  return filtered.sort((a, b) => {
    return a.id - b.id;
  });
});

// Recherche avec debounce
const debounceSearch = debounce(() => {
  // La recherche est automatiquement appliquée via le computed filteredCars
}, 300);

// Réinitialiser les filtres
function resetFilters() {
  filters.value = {
    search: '',
    category: '',
    type: '',
    available: ''
  };
}

// Changer de page
function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchCars();
  }
}

// Obtenir le type de véhicule en fonction de la catégorie
function getCategoryType(car) {
  // Si car est un objet voiture complet avec une relation category
  if (car && typeof car === 'object' && car.category && car.category.name) {
    return car.category.name;
  }
  
  // Si car est un ID de catégorie
  if (car && typeof car === 'number' || typeof car === 'string') {
    const categoryId = parseInt(car);
    return categoryTypeMap.value[categoryId] || 'Non spécifié';
  }
  
  return 'Non spécifié';
}

// Obtenir l'image de la voiture
function getCarImage(car) {
  // Vérifier si la voiture a un champ images JSON avec une valeur
  if (car.images && typeof car.images === 'object') {
    // Si c'est un objet JSON, utiliser la première image disponible
    const imageNames = Object.values(car.images);
    if (imageNames.length > 0) {
      try {
        return require(`@/assets/images/${imageNames[0]}`);
      } catch (e) {
        console.warn(`Image ${imageNames[0]} non trouvée dans le JSON images`);
      }
    }
  }
  
  // Si le champ images est une chaîne JSON, essayer de la parser
  if (car.images && typeof car.images === 'string' && car.images.trim() !== '') {
    try {
      const parsedImages = JSON.parse(car.images);
      const imageNames = Object.values(parsedImages);
      if (imageNames.length > 0) {
        try {
          return require(`@/assets/images/${imageNames[0]}`);
        } catch (e) {
          console.warn(`Image ${imageNames[0]} non trouvée dans le JSON images parsé`);
        }
      }
    } catch (e) {
      console.warn('Erreur lors du parsing du JSON images:', e);
    }
  }
  
  // Si la voiture a une propriété image déjà définie et qu'elle n'est pas vide
  if (car.image && car.image.trim() !== '') {
    try {
      // Vérifier si l'image contient déjà l'extension
      const imagePath = car.image.endsWith('.webp') || car.image.endsWith('.jpg') || car.image.endsWith('.png') 
        ? car.image 
        : `${car.image}.webp`;
      return require(`@/assets/images/${imagePath}`);
    } catch (e) {
      console.warn(`Image ${car.image} non trouvée, utilisation de la convention de nommage`);
    }
  }
  
  // Utiliser la convention de nommage standard: marque_modèle_home.webp
  try {
    const imageName = `${car.brand.toLowerCase()}_${car.model.toLowerCase().replace(/ /g, '_')}_home.webp`;
    return require(`@/assets/images/${imageName}`);
  } catch (e) {
    // Si l'image n'existe pas, retourner une image par défaut selon la catégorie
    const defaultImages = {
      1: 'audi_rsq3_home.webp',
      2: 'audi_q7_home.webp',
      3: 'audi_q8_home.webp',
      4: 'mercedes_classe_s_home.webp',
      5: 'porsche_911_home.webp',
      6: 'lamborghini_aventador_svj_home.webp'
    };
    
    try {
      return require(`@/assets/images/${defaultImages[car.category] || defaultImages[1]}`);
    } catch (e) {
      // Fallback final
      return require('@/assets/images/audi_rsq3_home.webp');
    }
  }
}

// Éditer une voiture
function editCar(car) {
  selectedCar.value = car;
  
  console.log('Données de la voiture à éditer:', car);
  
  let imageUrl = '';
  // Vérifier si car.images existe et est une chaîne JSON valide
  if (car.images && typeof car.images === 'string') {
    try {
      const parsedImages = JSON.parse(car.images);
      if (Array.isArray(parsedImages) && parsedImages.length > 0) {
        imageUrl = parsedImages[0];
      }
    } catch (e) {
      console.warn('Erreur de parsing JSON pour les images:', e);
    }
  } else if (car.images && Array.isArray(car.images) && car.images.length > 0) {
    // Si car.images est déjà un tableau
    imageUrl = car.images[0];
  } else if (car.image) {
    imageUrl = car.image;
  }
  
  carForm.value = {
    brand: car.brand || '',
    model: car.model || '',
    year: car.year || new Date().getFullYear(),
    color: car.color || 'Noir',
    licensePlate: car.licensePlate || '',
    mileage: car.mileage || 0,
    // Utiliser l'ID de catégorie à partir de la relation category ou categoryId
    category: car.categoryId || (car.category && car.category.id) || 1,
    type: car.type || '',
    dailyPrice: car.dailyPrice || 0,
    depositAmount: car.depositAmount || 0,
    includedKm: car.includedKm || 0,
    extraKmPrice: car.extraKmPrice || 0,
    seats: car.seats || 5,
    transmission: car.transmission || 'Automatique',
    fuelType: car.fuelType || 'Essence',
    available: car.isAvailable !== undefined ? car.isAvailable : true,
    description: car.description || '',
    features: car.features ? { ...car.features } : {
      seats: 5,
      doors: 5,
      transmission: 'Automatique',
      engine: 'Essence',
      power: 0
    },
    image: imageUrl || car.image || ''
  };
  
  showEditCarModal.value = true;
}

// Voir les détails d'une voiture
function viewCarDetails(car) {
  selectedCar.value = car;
  showCarDetailsModal.value = true;
}

// Confirmer la suppression d'une voiture
function confirmDeleteCar(car) {
  selectedCar.value = car;
  showDeleteModal.value = true;
}

// Supprimer une voiture
async function deleteCar() {
  if (!selectedCar.value) return;
  
  try {
    console.log('Suppression de la voiture avec ID:', selectedCar.value.id);
    await api.delete(`/api/cars/${selectedCar.value.id}`);
    await fetchCars();
    showDeleteModal.value = false;
    selectedCar.value = null;
  } catch (err) {
    error.value = 'Erreur lors de la suppression du véhicule';
    console.error('Erreur deleteCar:', err);
  }
}

// Soumettre le formulaire de voiture
async function submitCarForm() {
  try {
    // Préparer les données avec le format attendu par l'API
    const carData = {
      brand: carForm.value.brand,
      model: carForm.value.model,
      year: parseInt(carForm.value.year),
      color: carForm.value.color,
      licensePlate: carForm.value.licensePlate,
      mileage: parseInt(carForm.value.mileage),
      categoryId: parseInt(carForm.value.category),
      dailyPrice: parseFloat(carForm.value.dailyPrice),
      depositAmount: parseFloat(carForm.value.depositAmount),
      includedKm: parseInt(carForm.value.includedKm),
      extraKmPrice: parseFloat(carForm.value.extraKmPrice),
      seats: parseInt(carForm.value.features.seats),
      transmission: carForm.value.transmission,
      fuelType: carForm.value.fuelType,
      isAvailable: carForm.value.available,
      description: carForm.value.description,
      features: {
        seats: parseInt(carForm.value.features.seats),
        doors: parseInt(carForm.value.features.doors),
        transmission: carForm.value.features.transmission,
        engine: carForm.value.features.engine,
        power: parseInt(carForm.value.features.power)
      },
      // Ajouter le type comme information supplémentaire dans features
      type: carForm.value.type || categoryTypeMap.value[parseInt(carForm.value.category)],
      // Convertir l'image en tableau d'images si ce n'est pas déjà un tableau
      images: carForm.value.image ? [carForm.value.image] : []
    };
    
    console.log('Données de la voiture à envoyer:', carData);
    
    if (showEditCarModal.value) {
      // Mise à jour d'une voiture existante
      await api.put(`/api/cars/${selectedCar.value.id}`, carData);
    } else {
      // Création d'une nouvelle voiture
      await api.post('/api/cars', carData);
    }
    
    await fetchCars();
    closeCarModal();
  } catch (err) {
    error.value = 'Erreur lors de l\'enregistrement du véhicule';
    console.error(err);
  }
}

// Fermer le modal de voiture
function closeCarModal() {
  showAddCarModal.value = false;
  showEditCarModal.value = false;
  selectedCar.value = null;
  carForm.value = {
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    color: 'Noir',
    licensePlate: '',
    mileage: 0,
    category: 1,
    type: '',
    dailyPrice: 0,
    depositAmount: 0,
    includedKm: 0,
    extraKmPrice: 0,
    seats: 5,
    transmission: 'Automatique',
    fuelType: 'Essence',
    available: true,
    description: '',
    features: {
      seats: 5,
      doors: 5,
      transmission: 'Automatique',
      engine: 'Essence',
      power: 0
    },
    image: ''
  };
}

// Formater la devise
function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}
</script>

<style scoped>
.car-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
  background: white;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-box {
  flex: 1;
  min-width: 250px;
  position: relative;
}

.search-box i {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #333;
}

.filter-group select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #3B82F6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-container p {
  color: #EF4444;
  margin-bottom: 1rem;
}

.cars-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
}

.cars-table {
  width: 100%;
  border-collapse: collapse;
}

.cars-table th, .cars-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.cars-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.cars-table tr:hover {
  background-color: #f8f9fa;
}

.car-image-cell {
  width: 80px;
}

.car-thumbnail {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.available {
  background-color: #ECFDF5;
  color: #059669;
}

.status-badge.unavailable {
  background-color: #FEE2E2;
  color: #DC2626;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  border: none;
  background-color: #f8f9fa;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  background-color: #e9ecef;
}

.btn-icon.danger {
  color: #DC2626;
}

.btn-icon.danger:hover {
  background-color: #FEE2E2;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  gap: 1rem;
}

.btn-page {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: white;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.btn-page:hover:not(:disabled) {
  background-color: #f8f9fa;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.875rem;
  color: #6B7280;
}

.btn-primary {
  background-color: #3B82F6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: #2563EB;
}

.btn-secondary {
  background-color: #F3F4F6;
  color: #374151;
  border: 1px solid #D1D5DB;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-secondary:hover {
  background-color: #E5E7EB;
}

.btn-danger {
  background-color: #EF4444;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-danger:hover {
  background-color: #DC2626;
}

/* Styles pour les modales */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-content.modal-sm {
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group.full-width {
  grid-column: span 2;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
}

/* Styles pour les détails de voiture */
.car-details {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
}

.car-details-image img {
  width: 100%;
  height: auto;
  border-radius: 8px;
  object-fit: cover;
}

.car-details-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.detail-row {
  display: flex;
  flex-direction: column;
}

.detail-row.full-width {
  grid-column: span 2;
}

.detail-label {
  font-weight: 600;
  color: #666;
  font-size: 0.875rem;
}

.detail-value {
  font-size: 1rem;
  color: #333;
}

.detail-value.description {
  margin-top: 0.5rem;
  white-space: pre-line;
}

.features-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.feature-item {
  display: flex;
  flex-direction: column;
}

.feature-label {
  font-weight: 500;
  color: #666;
  font-size: 0.875rem;
}

.feature-value {
  font-size: 1rem;
  color: #333;
}
</style>
