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
          <option value="1">Catégorie 1</option>
          <option value="2">Catégorie 2</option>
          <option value="3">Catégorie 3</option>
          <option value="4">Catégorie 4</option>
          <option value="5">Catégorie 5</option>
          <option value="6">Catégorie 6</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Type:</label>
        <select v-model="filters.type">
          <option value="">Tous</option>
          <option value="SUV Compact">SUV Compact</option>
          <option value="SUV">SUV</option>
          <option value="SUV Premium">SUV Premium</option>
          <option value="Luxe">Luxe</option>
          <option value="Sport">Sport</option>
          <option value="Supercar">Supercar</option>
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
            <th>Type</th>
            <th>Prix/jour</th>
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
            <td>{{ car.category }}</td>
            <td>{{ car.type || getCategoryType(car.category) }}</td>
            <td>{{ formatCurrency(car.pricePerDay) }}</td>
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
  category: 1,
  type: '',
  pricePerDay: 0,
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

// Mapping des catégories vers les types
const categoryTypeMap = {
  1: 'SUV Compact',
  2: 'SUV',
  3: 'SUV Premium',
  4: 'Luxe',
  5: 'Sport',
  6: 'Supercar'
};

// Récupérer les voitures
async function fetchCars() {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await api.get('/api/admin/cars', {
      params: {
        page: currentPage.value,
        limit: itemsPerPage.value
      }
    });
    
    cars.value = response.data.cars;
    totalPages.value = Math.ceil(response.data.total / itemsPerPage.value);
  } catch (err) {
    error.value = 'Erreur lors de la récupération des véhicules';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

// Initialiser les données au chargement du composant
onMounted(async () => {
  await fetchCars();
});

// Filtrer les voitures
const filteredCars = computed(() => {
  return cars.value.filter(car => {
    // Filtre de recherche
    const searchMatch = filters.value.search === '' || 
      car.brand.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      car.model.toLowerCase().includes(filters.value.search.toLowerCase());
    
    // Filtre de catégorie
    const categoryMatch = filters.value.category === '' || 
      car.category.toString() === filters.value.category;
    
    // Filtre de type
    const typeMatch = filters.value.type === '' || 
      (car.type && car.type.toLowerCase() === filters.value.type.toLowerCase()) ||
      (getCategoryType(car.category) === filters.value.type);
    
    // Filtre de disponibilité
    const availableMatch = filters.value.available === '' || 
      (filters.value.available === 'true' && car.available) ||
      (filters.value.available === 'false' && !car.available);
    
    return searchMatch && categoryMatch && typeMatch && availableMatch;
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
function getCategoryType(category) {
  return categoryTypeMap[category] || 'Non spécifié';
}

// Obtenir l'image de la voiture
function getCarImage(car) {
  // Gérer le cas spécial de la Lamborghini Aventador SVJ
  if (car.brand === 'Lamborghini' && car.model === 'Aventador SVJ') {
    try {
      return require('@/assets/images/lamborghini_aventador_svj_home.webp');
    } catch (e) {
      console.warn('Image spéciale non trouvée pour Lamborghini Aventador SVJ');
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
    console.warn(`Image ${car.brand}_${car.model} non trouvée selon la convention de nommage`);
    
    // Essayer avec une convention alternative sans le suffixe _home
    try {
      const alternativeImageName = `${car.brand.toLowerCase()}_${car.model.toLowerCase().replace(/ /g, '_')}.webp`;
      return require(`@/assets/images/${alternativeImageName}`);
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
}

// Éditer une voiture
function editCar(car) {
  selectedCar.value = car;
  
  // Préparer le formulaire avec les données de la voiture
  carForm.value = {
    brand: car.brand,
    model: car.model,
    category: car.category,
    type: car.type || getCategoryType(car.category),
    pricePerDay: car.pricePerDay,
    available: car.available,
    description: car.description || '',
    features: car.features ? { ...car.features } : {
      seats: 5,
      doors: 5,
      transmission: 'Automatique',
      engine: 'Essence',
      power: 0
    },
    image: car.image || ''
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
    await api.delete(`/api/admin/cars/${selectedCar.value.id}`);
    await fetchCars();
    showDeleteModal.value = false;
    selectedCar.value = null;
  } catch (err) {
    error.value = 'Erreur lors de la suppression du véhicule';
    console.error(err);
  }
}

// Soumettre le formulaire de voiture
async function submitCarForm() {
  try {
    // Préparer les données avec le format attendu par l'API
    const carData = {
      brand: carForm.value.brand,
      model: carForm.value.model,
      category: parseInt(carForm.value.category),
      type: carForm.value.type,
      pricePerDay: parseFloat(carForm.value.pricePerDay),
      available: carForm.value.available,
      description: carForm.value.description,
      features: {
        seats: parseInt(carForm.value.features.seats),
        doors: parseInt(carForm.value.features.doors),
        transmission: carForm.value.features.transmission,
        engine: carForm.value.features.engine,
        power: parseInt(carForm.value.features.power)
      },
      image: carForm.value.image
    };
    
    if (showEditCarModal.value) {
      // Mise à jour d'une voiture existante
      await api.put(`/api/admin/cars/${selectedCar.value.id}`, carData);
    } else {
      // Création d'une nouvelle voiture
      await api.post('/api/admin/cars', carData);
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
    category: 1,
    type: '',
    pricePerDay: 0,
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
</style>
