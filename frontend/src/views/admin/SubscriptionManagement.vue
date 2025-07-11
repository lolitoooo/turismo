<template>
  <div class="subscription-management">
    <div class="page-header">
      <h1>Gestion des Abonnements</h1>
      <div class="header-actions">
        <button class="btn-primary" @click="showAddSubscriptionModal = true">
          <i class="pi pi-plus"></i> Ajouter un abonnement
        </button>
      </div>
    </div>

    <!-- Tableau des types d'abonnements -->
    <div class="section-title">
      <h2>Types d'abonnements</h2>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
    </div>

    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <button class="btn-primary" @click="fetchSubscriptionTypes">Réessayer</button>
    </div>

    <div v-else class="subscription-table-container">
      <table class="subscription-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Niveau</th>
            <th>Prix</th>
            <th>Jours/mois</th>
            <th>Description</th>
            <th>Mis en avant</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="subscription in subscriptionTypes" :key="subscription.id">
            <td>{{ subscription.id }}</td>
            <td>{{ subscription.name }}</td>
            <td>{{ subscription.level }}</td>
            <td>{{ formatCurrency(subscription.price) }}</td>
            <td>{{ subscription.daysPerMonth }}</td>
            <td class="description-cell">{{ subscription.description }}</td>
            <td>
              <span class="badge" :class="subscription.featured ? 'featured' : 'not-featured'">
                {{ subscription.featured ? 'Oui' : 'Non' }}
              </span>
            </td>
            <td class="actions">
              <button class="btn-icon" @click="editSubscriptionType(subscription)">
                <i class="pi pi-pencil"></i>
              </button>
              <button class="btn-icon" @click="viewSubscriptionDetails(subscription)">
                <i class="pi pi-eye"></i>
              </button>
              <button class="btn-icon danger" @click="confirmDeleteSubscription(subscription)">
                <i class="pi pi-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Abonnements utilisateurs actifs -->
    <div class="section-title">
      <h2>Abonnements utilisateurs actifs</h2>
      <div class="header-actions">
        <button class="btn-primary" @click="showAddUserSubscriptionModal = true">
          <i class="pi pi-plus"></i> Ajouter un abonnement utilisateur
        </button>
      </div>
    </div>

    <div class="filters">
      <div class="search-box">
        <i class="pi pi-search"></i>
        <input 
          type="text" 
          v-model="filters.search" 
          placeholder="Rechercher un utilisateur..." 
          @input="debounceSearch"
        />
      </div>
      <div class="filter-group">
        <label>Type d'abonnement:</label>
        <select v-model="filters.subscriptionType">
          <option value="">Tous</option>
          <option v-for="type in subscriptionTypes" :key="type.id" :value="type.id">
            {{ type.name }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label>Statut:</label>
        <select v-model="filters.status">
          <option value="">Tous</option>
          <option value="active">Actif</option>
          <option value="expired">Expiré</option>
        </select>
      </div>
      <button class="btn-secondary" @click="resetFilters">
        <i class="pi pi-filter-slash"></i> Réinitialiser
      </button>
    </div>

    <div v-if="loadingUserSubscriptions" class="loading-container">
      <div class="spinner"></div>
    </div>

    <div v-else-if="userSubscriptionsError" class="error-container">
      <p>{{ userSubscriptionsError }}</p>
      <button class="btn-primary" @click="fetchUserSubscriptions">Réessayer</button>
    </div>

    <div v-else class="subscription-table-container">
      <table class="subscription-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Utilisateur</th>
            <th>Type</th>
            <th>Date de début</th>
            <th>Date d'expiration</th>
            <th>Prix</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="subscription in filteredUserSubscriptions" :key="subscription.id">
            <td>{{ subscription.id }}</td>
            <td>{{ subscription.user.firstName }} {{ subscription.user.lastName }}</td>
            <td>{{ subscription.subscriptionType.name }}</td>
            <td>{{ formatDate(subscription.startDate) }}</td>
            <td>{{ formatDate(subscription.expiryDate) }}</td>
            <td>{{ formatCurrency(subscription.price) }}</td>
            <td>
              <span class="status-badge" :class="isSubscriptionActive(subscription) ? 'active' : 'expired'">
                {{ isSubscriptionActive(subscription) ? 'Actif' : 'Expiré' }}
              </span>
            </td>
            <td class="actions">
              <button class="btn-icon" @click="editUserSubscription(subscription)">
                <i class="pi pi-pencil"></i>
              </button>
              <button class="btn-icon danger" @click="confirmCancelSubscription(subscription)">
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
    
    <!-- Modal d'ajout d'abonnement utilisateur -->
    <div class="modal" v-if="showAddUserSubscriptionModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Ajouter un abonnement utilisateur</h3>
          <button class="btn-close" @click="closeNewUserSubscriptionModal">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="userSubscriptionsError" class="error-message">
            {{ userSubscriptionsError }}
          </div>
          
          <div class="form-group">
            <label for="userId">Utilisateur:</label>
            <select id="userId" v-model="newUserSubscriptionForm.userId" required>
              <option value="">Sélectionner un utilisateur</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="subscriptionTypeId">Type d'abonnement:</label>
            <select id="subscriptionTypeId" v-model="newUserSubscriptionForm.subscriptionTypeId" 
                    @change="updatePrice" required>
              <option value="">Sélectionner un type d'abonnement</option>
              <option v-for="type in subscriptionTypes" :key="type.id" :value="type.id">
                {{ type.name }} - {{ formatCurrency(type.price) }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="startDate">Date de début:</label>
            <input type="date" id="startDate" v-model="newUserSubscriptionForm.startDate" required>
          </div>
          
          <div class="form-group">
            <label for="expiryDate">Date d'expiration:</label>
            <input type="date" id="expiryDate" v-model="newUserSubscriptionForm.expiryDate" required>
          </div>
          
          <div class="form-group">
            <label for="price">Prix:</label>
            <input type="number" id="price" v-model="newUserSubscriptionForm.price" step="0.01" required>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="closeNewUserSubscriptionModal">Annuler</button>
          <button class="btn-primary" @click="submitNewUserSubscriptionForm">Ajouter</button>
        </div>
      </div>
    </div>
    
    <!-- Modal d'édition d'abonnement utilisateur -->
    <div class="modal" v-if="showEditUserSubscriptionModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Modifier l'abonnement utilisateur</h3>
          <button class="btn-close" @click="showEditUserSubscriptionModal = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="userSubscriptionsError" class="error-message">
            {{ userSubscriptionsError }}
          </div>
          
          <div class="form-group">
            <label for="edit-subscriptionTypeId">Type d'abonnement:</label>
            <select id="edit-subscriptionTypeId" v-model="userSubscriptionForm.subscriptionTypeId">
              <option v-for="type in subscriptionTypes" :key="type.id" :value="type.id">
                {{ type.name }} - {{ formatCurrency(type.price) }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="edit-startDate">Date de début:</label>
            <input type="date" id="edit-startDate" v-model="userSubscriptionForm.startDate">
          </div>
          
          <div class="form-group">
            <label for="edit-expiryDate">Date d'expiration:</label>
            <input type="date" id="edit-expiryDate" v-model="userSubscriptionForm.expiryDate">
          </div>
          
          <div class="form-group">
            <label for="edit-price">Prix:</label>
            <input type="number" id="edit-price" v-model="userSubscriptionForm.price" step="0.01">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showEditUserSubscriptionModal = false">Annuler</button>
          <button class="btn-primary" @click="submitUserSubscriptionForm">Enregistrer</button>
        </div>
      </div>
    </div>
    
    <!-- Modal de confirmation d'annulation d'abonnement -->
    <div class="modal" v-if="showCancelSubscriptionModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Confirmer l'annulation</h3>
          <button class="btn-close" @click="showCancelSubscriptionModal = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Êtes-vous sûr de vouloir annuler cet abonnement ?</p>
          <p>Cette action est irréversible.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showCancelSubscriptionModal = false">Non</button>
          <button class="btn-danger" @click="cancelSubscription">Oui, annuler</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import api from '@/services/api';
import { debounce } from 'lodash';

const authStore = useAuthStore();
const router = useRouter();

// États
const subscriptionTypes = ref([]);
const userSubscriptions = ref([]);
const users = ref([]);
const loading = ref(false);
const loadingUserSubscriptions = ref(false);
const loadingUsers = ref(false);
const error = ref(null);
const userSubscriptionsError = ref(null);
const usersError = ref(null);
const currentPage = ref(1);
const totalPages = ref(1);
const itemsPerPage = 10;

// Filtres
const filters = ref({
  search: '',
  subscriptionType: '',
  status: ''
});

// Modals
const showAddSubscriptionModal = ref(false);
const showEditSubscriptionModal = ref(false);
const showDeleteModal = ref(false);
const showSubscriptionDetailsModal = ref(false);
const showAddUserSubscriptionModal = ref(false);
const showEditUserSubscriptionModal = ref(false);
const showCancelSubscriptionModal = ref(false);
const selectedSubscription = ref(null);
const selectedUserSubscription = ref(null);
const subscriptionForm = ref({
  name: '',
  level: 1,
  price: 0,
  daysPerMonth: 30,
  description: '',
  featured: false,
  services: [
    { name: 'Livraison du véhicule', included: false },
    { name: 'Conciergerie', included: false },
    { name: 'Hotline dédiée', included: false },
    { name: 'Nettoyage personnalisé', included: false }
  ]
});
const userSubscriptionForm = ref({
  userId: '',
  subscriptionTypeId: '',
  startDate: '',
  expiryDate: '',
  price: 0
});

const newUserSubscriptionForm = ref({
  userId: '',
  subscriptionTypeId: '',
  startDate: new Date().toISOString().split('T')[0],
  expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
  price: 0
});

// Vérifier si l'utilisateur est admin
onMounted(async () => {
  if (!authStore.isAdmin) {
    router.push('/dashboard');
    return;
  }
  
  await fetchSubscriptionTypes();
  await fetchUserSubscriptions();
  await fetchUsers();
});

// Récupérer la liste des utilisateurs
async function fetchUsers() {
  loadingUsers.value = true;
  usersError.value = null;
  
  try {
    const response = await api.get('/api/admin/users');
    if (response.data && response.data.users) {
      users.value = response.data.users;
    }
  } catch (err) {
    usersError.value = 'Erreur lors de la récupération des utilisateurs';
    console.error(err);
  } finally {
    loadingUsers.value = false;
  }
}

// Récupérer les types d'abonnements
async function fetchSubscriptionTypes() {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await api.get('/api/admin/subscriptions');
    if (response.data && response.data.subscriptions) {
      subscriptionTypes.value = response.data.subscriptions;
    }
  } catch (err) {
    error.value = 'Erreur lors de la récupération des types d\'abonnement';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

// Récupérer les abonnements utilisateurs
async function fetchUserSubscriptions() {
  loadingUserSubscriptions.value = true;
  userSubscriptionsError.value = null;
  
  try {
    const response = await api.get('/api/admin/user-subscriptions', {
      params: {
        page: currentPage.value,
        limit: itemsPerPage
      }
    });
    
    if (response.data) {
      userSubscriptions.value = response.data.subscriptions;
      totalPages.value = Math.ceil(response.data.total / itemsPerPage);
    }
  } catch (err) {
    userSubscriptionsError.value = 'Erreur lors de la récupération des abonnements utilisateurs';
    console.error(err);
  } finally {
    loadingUserSubscriptions.value = false;
  }
}

// Filtrer les abonnements utilisateurs
const filteredUserSubscriptions = computed(() => {
  return userSubscriptions.value.filter(subscription => {
    // Filtre de recherche
    const searchMatch = filters.value.search === '' || 
      subscription.user.firstName.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      subscription.user.lastName.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      subscription.user.email.toLowerCase().includes(filters.value.search.toLowerCase());
    
    // Filtre de type d'abonnement
    const typeMatch = filters.value.subscriptionType === '' || 
      subscription.subscriptionType.id.toString() === filters.value.subscriptionType.toString();
    
    // Filtre de statut
    const statusMatch = filters.value.status === '' || 
      (filters.value.status === 'active' && isSubscriptionActive(subscription)) ||
      (filters.value.status === 'expired' && !isSubscriptionActive(subscription));
    
    return searchMatch && typeMatch && statusMatch;
  });
});

// Recherche avec debounce
const debounceSearch = debounce(() => {
  // La recherche est automatiquement appliquée via le computed filteredUserSubscriptions
}, 300);

// Réinitialiser les filtres
function resetFilters() {
  filters.value = {
    search: '',
    subscriptionType: '',
    status: ''
  };
}

// Changer de page
function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchUserSubscriptions();
  }
}

// Vérifier si un abonnement est actif
function isSubscriptionActive(subscription) {
  const now = new Date();
  const expiryDate = new Date(subscription.expiryDate);
  return expiryDate > now;
}

// Éditer un type d'abonnement
function editSubscriptionType(subscription) {
  selectedSubscription.value = subscription;
  subscriptionForm.value = {
    name: subscription.name,
    level: subscription.level,
    price: subscription.price,
    daysPerMonth: subscription.daysPerMonth,
    description: subscription.description,
    featured: subscription.featured,
    services: subscription.services || [
      { name: 'Livraison du véhicule', included: false },
      { name: 'Conciergerie', included: false },
      { name: 'Hotline dédiée', included: false },
      { name: 'Nettoyage personnalisé', included: false }
    ]
  };
  showEditSubscriptionModal.value = true;
}

// Voir les détails d'un type d'abonnement
function viewSubscriptionDetails(subscription) {
  selectedSubscription.value = subscription;
  showSubscriptionDetailsModal.value = true;
}

// Confirmer la suppression d'un type d'abonnement
function confirmDeleteSubscription(subscription) {
  selectedSubscription.value = subscription;
  showDeleteModal.value = true;
}

// Supprimer un type d'abonnement
async function deleteSubscription() {
  if (!selectedSubscription.value) return;
  
  try {
    await api.delete(`/api/admin/subscriptions/${selectedSubscription.value.id}`);
    await fetchSubscriptionTypes();
    showDeleteModal.value = false;
    selectedSubscription.value = null;
  } catch (err) {
    error.value = 'Erreur lors de la suppression du type d\'abonnement';
    console.error(err);
  }
}

// Éditer un abonnement utilisateur
function editUserSubscription(subscription) {
  selectedUserSubscription.value = subscription;
  userSubscriptionForm.value = {
    userId: subscription.userId,
    subscriptionTypeId: subscription.subscriptionType.id,
    startDate: subscription.startDate,
    expiryDate: subscription.expiryDate,
    price: subscription.price
  };
  showEditUserSubscriptionModal.value = true;
}

// Confirmer l'annulation d'un abonnement utilisateur
function confirmCancelSubscription(subscription) {
  selectedUserSubscription.value = subscription;
  showCancelSubscriptionModal.value = true;
}

// Annuler un abonnement utilisateur
async function cancelSubscription() {
  if (!selectedUserSubscription.value) return;
  
  try {
    await api.delete(`/api/admin/user-subscriptions/${selectedUserSubscription.value.id}`);
    await fetchUserSubscriptions();
    showCancelSubscriptionModal.value = false;
    selectedUserSubscription.value = null;
  } catch (err) {
    userSubscriptionsError.value = 'Erreur lors de l\'annulation de l\'abonnement';
    console.error(err);
  }
}

// Soumettre le formulaire de type d'abonnement
async function submitSubscriptionForm() {
  try {
    // Préparer les données avec le format attendu par l'API
    const subscriptionData = {
      name: subscriptionForm.value.name,
      level: subscriptionForm.value.level,
      price: subscriptionForm.value.price,
      description: subscriptionForm.value.description,
      features: {
        level: subscriptionForm.value.level,
        days_per_month: subscriptionForm.value.daysPerMonth,
        featured: subscriptionForm.value.featured,
        delivery_included: subscriptionForm.value.services[0].included,
        concierge_included: subscriptionForm.value.services[1].included,
        hotline_included: subscriptionForm.value.services[2].included,
        cleaning_included: subscriptionForm.value.services[3].included
      }
    };
    
    if (showEditSubscriptionModal.value) {
      // Mise à jour d'un type d'abonnement existant
      await api.put(`/api/admin/subscriptions/${selectedSubscription.value.id}`, subscriptionData);
    } else {
      // Création d'un nouveau type d'abonnement
      await api.post('/api/admin/subscriptions', subscriptionData);
    }
    
    await fetchSubscriptionTypes();
    closeSubscriptionModal();
  } catch (err) {
    error.value = 'Erreur lors de l\'enregistrement du type d\'abonnement';
    console.error(err);
  }
}

// Soumettre le formulaire d'abonnement utilisateur
async function submitUserSubscriptionForm() {
  try {
    // Formater les données pour l'API
    const formData = {
      subscriptionTypeId: parseInt(userSubscriptionForm.value.subscriptionTypeId),
      startDate: userSubscriptionForm.value.startDate,
      expiryDate: userSubscriptionForm.value.expiryDate,
      price: parseFloat(userSubscriptionForm.value.price)
    };
    
    await api.put(`/api/admin/user-subscriptions/${selectedUserSubscription.value.id}`, formData);
    await fetchUserSubscriptions();
    showEditUserSubscriptionModal.value = false;
    selectedUserSubscription.value = null;
  } catch (err) {
    userSubscriptionsError.value = 'Erreur lors de la mise à jour de l\'abonnement utilisateur';
    console.error(err);
  }
}

// Soumettre le formulaire d'ajout d'un nouvel abonnement utilisateur
async function submitNewUserSubscriptionForm() {
  try {
    // Vérifier que tous les champs obligatoires sont remplis
    if (!newUserSubscriptionForm.value.userId || !newUserSubscriptionForm.value.subscriptionTypeId ||
        !newUserSubscriptionForm.value.startDate || !newUserSubscriptionForm.value.expiryDate) {
      userSubscriptionsError.value = 'Tous les champs sont obligatoires';
      return;
    }

    // Formater les données pour l'API
    const formData = {
      userId: parseInt(newUserSubscriptionForm.value.userId),
      subscriptionTypeId: parseInt(newUserSubscriptionForm.value.subscriptionTypeId),
      startDate: newUserSubscriptionForm.value.startDate,
      expiryDate: newUserSubscriptionForm.value.expiryDate,
      price: parseFloat(newUserSubscriptionForm.value.price) || 0
    };
    
    await api.post('/api/admin/user-subscriptions', formData);
    await fetchUserSubscriptions();
    closeNewUserSubscriptionModal();
  } catch (err) {
    userSubscriptionsError.value = 'Erreur lors de la création de l\'abonnement utilisateur';
    console.error(err);
  }
}

// Fermer le modal d'ajout d'abonnement utilisateur
function closeNewUserSubscriptionModal() {
  showAddUserSubscriptionModal.value = false;
  userSubscriptionsError.value = null;
  newUserSubscriptionForm.value = {
    userId: '',
    subscriptionTypeId: '',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    price: 0
  };
}

// Mettre à jour le prix en fonction du type d'abonnement sélectionné
function updatePrice() {
  if (newUserSubscriptionForm.value.subscriptionTypeId) {
    const selectedType = subscriptionTypes.value.find(
      type => type.id.toString() === newUserSubscriptionForm.value.subscriptionTypeId.toString()
    );
    
    if (selectedType) {
      newUserSubscriptionForm.value.price = selectedType.price;
    }
  }
}

// Fermer le modal de type d'abonnement
function closeSubscriptionModal() {
  showAddSubscriptionModal.value = false;
  showEditSubscriptionModal.value = false;
  selectedSubscription.value = null;
  subscriptionForm.value = {
    name: '',
    level: 1,
    price: 0,
    daysPerMonth: 30,
    description: '',
    featured: false,
    services: [
      { name: 'Livraison du véhicule', included: false },
      { name: 'Conciergerie', included: false },
      { name: 'Hotline dédiée', included: false },
      { name: 'Nettoyage personnalisé', included: false }
    ]
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
</script>

<style scoped>
.subscription-management {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #eee;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
}

.btn-close:hover {
  color: #333;
}

.form-group {
  margin-bottom: 1.5rem;
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

.error-message {
  background-color: #ffebee;
  color: #d32f2f;
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
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

.section-title {
  margin: 2rem 0 1rem;
}

.section-title h2 {
  font-size: 1.5rem;
  color: #333;
  margin: 0;
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

.subscription-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
}

.subscription-table {
  width: 100%;
  border-collapse: collapse;
}

.subscription-table th, .subscription-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.subscription-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.subscription-table tr:hover {
  background-color: #f8f9fa;
}

.description-cell {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.badge.featured {
  background-color: #ECFDF5;
  color: #059669;
}

.badge.not-featured {
  background-color: #F3F4F6;
  color: #6B7280;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.active {
  background-color: #ECFDF5;
  color: #059669;
}

.status-badge.expired {
  background-color: #FEF2F2;
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
