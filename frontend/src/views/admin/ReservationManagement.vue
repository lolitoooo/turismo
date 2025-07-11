<template>
  <div class="reservation-management">
    <div class="page-header">
      <h1>Gestion des Réservations</h1>
      <div class="header-actions">
        <button class="btn-primary" @click="showAddReservationModal = true">
          <i class="pi pi-plus"></i> Ajouter une réservation
        </button>
      </div>
    </div>

    <div class="filters">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input 
          type="text" 
          v-model="filters.search" 
          placeholder="Rechercher un utilisateur ou un véhicule..." 
          @input="debounceSearch"
        />
      </div>
      <div class="filter-group">
        <label>Statut:</label>
        <select v-model="filters.status">
          <option value="">Tous</option>
          <option value="pending">En attente</option>
          <option value="confirmed">Confirmée</option>
          <option value="in_progress">En cours</option>
          <option value="completed">Terminée</option>
          <option value="cancelled">Annulée</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Période:</label>
        <select v-model="filters.period">
          <option value="">Toutes</option>
          <option value="today">Aujourd'hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
          <option value="future">À venir</option>
          <option value="past">Passées</option>
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
      <button class="btn-primary" @click="fetchReservations">Réessayer</button>
    </div>

    <div v-else class="reservations-table-container">
      <table class="reservations-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Utilisateur</th>
            <th>Véhicule</th>
            <th>Date de début</th>
            <th>Date de fin</th>
            <th>Prix total</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="reservation in filteredReservations" :key="reservation.id">
            <td>{{ reservation.id }}</td>
            <td>{{ reservation.user.firstName }} {{ reservation.user.lastName }}</td>
            <td>{{ reservation.car.brand }} {{ reservation.car.model }}</td>
            <td>{{ formatDate(reservation.startDate) }}</td>
            <td>{{ formatDate(reservation.endDate) }}</td>
            <td>{{ formatCurrency(reservation.totalPrice) }}</td>
            <td>
              <span class="status-badge" :class="reservation.status">
                {{ formatStatus(reservation.status) }}
              </span>
            </td>
            <td class="actions">
              <button class="btn-icon" @click="editReservation(reservation)">
                <i class="pi pi-pencil"></i>
              </button>
              <button class="btn-icon" @click="viewReservationDetails(reservation)">
                <i class="pi pi-eye"></i>
              </button>
              <button class="btn-icon danger" @click="confirmCancelReservation(reservation)">
                <i class="pi pi-times"></i>
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

// État des réservations
const reservations = ref([]);
const loading = ref(true);
const error = ref(null);
const currentPage = ref(1);
const totalPages = ref(1);
const itemsPerPage = ref(10);

// État des filtres
const filters = ref({
  search: '',
  status: '',
  period: ''
});

// État des modals
const showAddReservationModal = ref(false);
const showEditReservationModal = ref(false);
const showReservationDetailsModal = ref(false);
const showCancelReservationModal = ref(false);
const selectedReservation = ref(null);

// Formulaire de réservation
const reservationForm = ref({
  userId: '',
  carId: '',
  startDate: '',
  endDate: '',
  totalPrice: 0,
  status: 'pending'
});

// Listes pour les selects
const users = ref([]);
const cars = ref([]);

// Récupérer les réservations
async function fetchReservations() {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await api.get('/api/admin/reservations', {
      params: {
        page: currentPage.value,
        limit: itemsPerPage.value
      }
    });
    
    reservations.value = response.data.reservations;
    totalPages.value = Math.ceil(response.data.total / itemsPerPage.value);
  } catch (err) {
    error.value = 'Erreur lors de la récupération des réservations';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

// Récupérer les utilisateurs pour le formulaire
async function fetchUsers() {
  try {
    const response = await api.get('/api/admin/users');
    users.value = response.data.users;
  } catch (err) {
    console.error('Erreur lors de la récupération des utilisateurs:', err);
  }
}

// Récupérer les voitures pour le formulaire
async function fetchCars() {
  try {
    const response = await api.get('/api/cars');
    cars.value = response.data.cars;
  } catch (err) {
    console.error('Erreur lors de la récupération des voitures:', err);
  }
}

// Initialiser les données au chargement du composant
onMounted(async () => {
  await Promise.all([fetchReservations(), fetchUsers(), fetchCars()]);
});

// Filtrer les réservations
const filteredReservations = computed(() => {
  return reservations.value.filter(reservation => {
    // Filtre de recherche
    const searchMatch = filters.value.search === '' || 
      reservation.user.firstName.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      reservation.user.lastName.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      reservation.car.brand.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      reservation.car.model.toLowerCase().includes(filters.value.search.toLowerCase());
    
    // Filtre de statut
    const statusMatch = filters.value.status === '' || reservation.status === filters.value.status;
    
    // Filtre de période
    let periodMatch = true;
    const now = new Date();
    const startDate = new Date(reservation.startDate);
    const endDate = new Date(reservation.endDate);
    
    if (filters.value.period === 'today') {
      // Aujourd'hui
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      periodMatch = startDate >= today && startDate < tomorrow;
    } else if (filters.value.period === 'week') {
      // Cette semaine
      const firstDay = new Date(now);
      firstDay.setDate(now.getDate() - now.getDay());
      firstDay.setHours(0, 0, 0, 0);
      const lastDay = new Date(firstDay);
      lastDay.setDate(firstDay.getDate() + 7);
      periodMatch = startDate >= firstDay && startDate < lastDay;
    } else if (filters.value.period === 'month') {
      // Ce mois
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      periodMatch = startDate >= firstDay && startDate <= lastDay;
    } else if (filters.value.period === 'future') {
      // À venir
      periodMatch = startDate > now;
    } else if (filters.value.period === 'past') {
      // Passées
      periodMatch = endDate < now;
    }
    
    return searchMatch && statusMatch && periodMatch;
  });
});

// Recherche avec debounce
const debounceSearch = debounce(() => {
  // La recherche est automatiquement appliquée via le computed filteredReservations
}, 300);

// Réinitialiser les filtres
function resetFilters() {
  filters.value = {
    search: '',
    status: '',
    period: ''
  };
}

// Changer de page
function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchReservations();
  }
}

// Éditer une réservation
function editReservation(reservation) {
  selectedReservation.value = reservation;
  reservationForm.value = {
    userId: reservation.userId,
    carId: reservation.carId,
    startDate: reservation.startDate.split('T')[0], // Format YYYY-MM-DD pour l'input date
    endDate: reservation.endDate.split('T')[0],
    totalPrice: reservation.totalPrice,
    status: reservation.status
  };
  showEditReservationModal.value = true;
}

// Voir les détails d'une réservation
function viewReservationDetails(reservation) {
  selectedReservation.value = reservation;
  showReservationDetailsModal.value = true;
}

// Confirmer l'annulation d'une réservation
function confirmCancelReservation(reservation) {
  selectedReservation.value = reservation;
  showCancelReservationModal.value = true;
}

// Annuler une réservation
async function cancelReservation() {
  if (!selectedReservation.value) return;
  
  try {
    await api.put(`/api/admin/reservations/${selectedReservation.value.id}`, {
      status: 'cancelled'
    });
    await fetchReservations();
    showCancelReservationModal.value = false;
    selectedReservation.value = null;
  } catch (err) {
    error.value = 'Erreur lors de l\'annulation de la réservation';
    console.error(err);
  }
}

// Soumettre le formulaire de réservation
async function submitReservationForm() {
  try {
    if (showEditReservationModal.value) {
      // Mise à jour d'une réservation existante
      await api.put(`/api/admin/reservations/${selectedReservation.value.id}`, reservationForm.value);
    } else {
      // Création d'une nouvelle réservation
      await api.post('/api/admin/reservations', reservationForm.value);
    }
    
    await fetchReservations();
    closeReservationModal();
  } catch (err) {
    error.value = 'Erreur lors de l\'enregistrement de la réservation';
    console.error(err);
  }
}

// Fermer le modal de réservation
function closeReservationModal() {
  showAddReservationModal.value = false;
  showEditReservationModal.value = false;
  selectedReservation.value = null;
  reservationForm.value = {
    userId: '',
    carId: '',
    startDate: '',
    endDate: '',
    totalPrice: 0,
    status: 'pending'
  };
}

// Formater la devise
function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

// Formater la date
function formatDate(dateString) {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

// Formater le statut
function formatStatus(status) {
  const statusMap = {
    'pending': 'En attente',
    'confirmed': 'Confirmée',
    'in_progress': 'En cours',
    'completed': 'Terminée',
    'cancelled': 'Annulée'
  };
  
  return statusMap[status] || status;
}
</script>

<style scoped>
.reservation-management {
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

.reservations-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
}

.reservations-table {
  width: 100%;
  border-collapse: collapse;
}

.reservations-table th, .reservations-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.reservations-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.reservations-table tr:hover {
  background-color: #f8f9fa;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.pending {
  background-color: #FEF3C7;
  color: #D97706;
}

.status-badge.confirmed {
  background-color: #DBEAFE;
  color: #2563EB;
}

.status-badge.in_progress {
  background-color: #E0E7FF;
  color: #4F46E5;
}

.status-badge.completed {
  background-color: #ECFDF5;
  color: #059669;
}

.status-badge.cancelled {
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
