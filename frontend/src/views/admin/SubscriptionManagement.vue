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
    
    <!-- Modal de détails d'un type d'abonnement -->
    <div class="modal" v-if="showSubscriptionDetailsModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Détails du type d'abonnement</h3>
          <button class="btn-close" @click="showSubscriptionDetailsModal = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body" v-if="selectedSubscription">
          <div class="detail-item">
            <span class="detail-label">ID:</span>
            <span class="detail-value">{{ selectedSubscription.id }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Nom:</span>
            <span class="detail-value">{{ selectedSubscription.name }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Niveau:</span>
            <span class="detail-value">{{ selectedSubscription.level }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Prix:</span>
            <span class="detail-value">{{ formatCurrency(selectedSubscription.price) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Jours par mois:</span>
            <span class="detail-value">{{ selectedSubscription.daysPerMonth || 0 }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Description:</span>
            <span class="detail-value">{{ selectedSubscription.description }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Mis en avant:</span>
            <span class="detail-value">{{ selectedSubscription.featured ? 'Oui' : 'Non' }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Date de création:</span>
            <span class="detail-value">{{ formatDate(selectedSubscription.createdAt) }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Dernière mise à jour:</span>
            <span class="detail-value">{{ formatDate(selectedSubscription.updatedAt) }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showSubscriptionDetailsModal = false">Fermer</button>
        </div>
      </div>
    </div>
    
    <!-- Modal de suppression d'un type d'abonnement -->
    <div class="modal" v-if="showDeleteSubscriptionModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Confirmer la suppression</h3>
          <button class="btn-close" @click="showDeleteSubscriptionModal = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Êtes-vous sûr de vouloir supprimer ce type d'abonnement ?</p>
          <p v-if="selectedSubscription">
            <strong>Nom:</strong> {{ selectedSubscription.name }}<br>
            <strong>Niveau:</strong> {{ selectedSubscription.level }}<br>
            <strong>Prix:</strong> {{ formatCurrency(selectedSubscription.price) }}
          </p>
          <p class="warning-text">Attention: Cette action est irréversible et supprimera définitivement ce type d'abonnement.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showDeleteSubscriptionModal = false">Annuler</button>
          <button class="btn-danger" @click="deleteSubscription">Supprimer</button>
        </div>
      </div>
    </div>
    
    <!-- Modal d'édition d'un type d'abonnement -->
    <div class="modal" v-if="showEditSubscriptionModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Éditer le type d'abonnement</h3>
          <button class="btn-close" @click="showEditSubscriptionModal = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
          
          <div class="form-group">
            <label for="edit-name">Nom:</label>
            <input type="text" id="edit-name" v-model="subscriptionForm.name" required>
          </div>
          
          <div class="form-group">
            <label for="edit-level">Niveau:</label>
            <select id="edit-level" v-model="subscriptionForm.level" required>
              <option value="1">1 - Starter</option>
              <option value="2">2 - Urban</option>
              <option value="3">3 - Executive</option>
              <option value="4">4 - Prestige</option>
              <option value="5">5 - Elite</option>
              <option value="6">6 - Signature</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="edit-price">Prix:</label>
            <input type="number" id="edit-price" v-model="subscriptionForm.price" step="0.01" required>
          </div>
          
          <div class="form-group">
            <label for="edit-days">Jours par mois:</label>
            <input type="number" id="edit-days" v-model="subscriptionForm.daysPerMonth" required>
          </div>
          
          <div class="form-group">
            <label for="edit-description">Description:</label>
            <textarea id="edit-description" v-model="subscriptionForm.description" rows="3"></textarea>
          </div>
          
          <div class="form-group checkbox-group">
            <input type="checkbox" id="edit-featured" v-model="subscriptionForm.featured">
            <label for="edit-featured">Mettre en avant</label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showEditSubscriptionModal = false">Annuler</button>
          <button class="btn-primary" @click="submitSubscriptionForm">Enregistrer</button>
        </div>
      </div>
    </div>
    
    <!-- Modal d'ajout de type d'abonnement -->
    <div class="modal" v-if="showAddSubscriptionModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Ajouter un type d'abonnement</h3>
          <button class="btn-close" @click="showAddSubscriptionModal = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="error" class="error-message">
            {{ error }}
          </div>
          
          <div class="form-group">
            <label for="name">Nom:</label>
            <input type="text" id="name" v-model="subscriptionForm.name" required>
          </div>
          
          <div class="form-group">
            <label for="level">Niveau:</label>
            <select id="level" v-model="subscriptionForm.level" required>
              <option value="1">1 - Starter</option>
              <option value="2">2 - Urban</option>
              <option value="3">3 - Executive</option>
              <option value="4">4 - Prestige</option>
              <option value="5">5 - Elite</option>
              <option value="6">6 - Signature</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="price">Prix:</label>
            <input type="number" id="price" v-model="subscriptionForm.price" step="0.01" required>
          </div>
          
          <div class="form-group">
            <label for="days">Jours par mois:</label>
            <input type="number" id="days" v-model="subscriptionForm.daysPerMonth" required>
          </div>
          
          <div class="form-group">
            <label for="description">Description:</label>
            <textarea id="description" v-model="subscriptionForm.description" rows="3"></textarea>
          </div>
          
          <div class="form-group checkbox-group">
            <input type="checkbox" id="featured" v-model="subscriptionForm.featured">
            <label for="featured">Mettre en avant</label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showAddSubscriptionModal = false">Annuler</button>
          <button class="btn-primary" @click="submitNewSubscriptionForm">Ajouter</button>
        </div>
      </div>
    </div>
    
    <!-- Modal de confirmation d'annulation d'abonnement utilisateur -->
    <div class="modal" v-if="showCancelUserSubscriptionModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Confirmer l'annulation</h3>
          <button class="btn-close" @click="showCancelUserSubscriptionModal = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Êtes-vous sûr de vouloir annuler cet abonnement utilisateur ?</p>
          <p v-if="selectedUserSubscription">
            <strong>Utilisateur:</strong> {{ selectedUserSubscription.user?.firstName }} {{ selectedUserSubscription.user?.lastName }}<br>
            <strong>Type d'abonnement:</strong> {{ selectedUserSubscription.subscriptionType?.name }}<br>
            <strong>Date d'expiration:</strong> {{ formatDate(selectedUserSubscription.expiryDate) }}
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="showCancelUserSubscriptionModal = false">Annuler</button>
          <button class="btn-danger" @click="cancelUserSubscription">Confirmer</button>
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
const showDeleteSubscriptionModal = ref(false);
const showSubscriptionDetailsModal = ref(false);
const showAddUserSubscriptionModal = ref(false);
const showEditUserSubscriptionModal = ref(false);
const showCancelUserSubscriptionModal = ref(false);
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

// Afficher les détails d'un type d'abonnement
function viewSubscriptionDetails(subscription) {
  selectedSubscription.value = subscription;
  showSubscriptionDetailsModal.value = true;
}

// Éditer un type d'abonnement
function editSubscriptionType(subscription) {
  selectedSubscription.value = subscription;
  
  // Extraire days_per_month des features si disponible
  let daysPerMonth = 30; // Valeur par défaut
  if (subscription.features && typeof subscription.features === 'object') {
    daysPerMonth = subscription.features.days_per_month || 30;
  } else if (subscription.features && typeof subscription.features === 'string') {
    try {
      const features = JSON.parse(subscription.features);
      daysPerMonth = features.days_per_month || 30;
    } catch (e) {
      console.error('Erreur lors du parsing des features:', e);
    }
  }
  
  subscriptionForm.value = {
    name: subscription.name,
    level: subscription.level,
    price: subscription.price,
    daysPerMonth: daysPerMonth,
    description: subscription.description || '',
    featured: false // Toujours mettre à false pour retirer la mise en avant
  };
  showEditSubscriptionModal.value = true;
}

// Confirmer la suppression d'un type d'abonnement
function confirmDeleteSubscription(subscription) {
  selectedSubscription.value = subscription;
  showDeleteSubscriptionModal.value = true;
}

// Supprimer un type d'abonnement
async function deleteSubscription() {
  try {
    await api.delete(`/api/admin/subscriptions/${selectedSubscription.value.id}`);
    await fetchSubscriptionTypes();
    showDeleteSubscriptionModal.value = false;
    selectedSubscription.value = null;
  } catch (err) {
    error.value = 'Erreur lors de la suppression du type d\'abonnement';
    console.error(err);
  }
}

// Soumettre le formulaire d'édition d'un type d'abonnement
async function submitSubscriptionForm() {
  try {
    // Préparer les données avec le format attendu par l'API
    const subscriptionData = {
      name: subscriptionForm.value.name,
      level: subscriptionForm.value.level,
      price: subscriptionForm.value.price,
      description: subscriptionForm.value.description,
      featured: false, // Toujours mettre à false pour retirer la mise en avant
      features: JSON.stringify({
        level: subscriptionForm.value.level,
        days_per_month: subscriptionForm.value.daysPerMonth
      })
    };
    
    await api.put(`/api/admin/subscriptions/${selectedSubscription.value.id}`, subscriptionData);
    await fetchSubscriptionTypes();
    showEditSubscriptionModal.value = false;
    selectedSubscription.value = null;
  } catch (err) {
    error.value = 'Erreur lors de la mise à jour du type d\'abonnement';
    console.error(err);
  }
}

// Soumettre le formulaire d'ajout d'un nouveau type d'abonnement
async function submitNewSubscriptionForm() {
  try {
    // Préparer les données avec le format attendu par l'API
    const subscriptionData = {
      name: subscriptionForm.value.name,
      level: subscriptionForm.value.level,
      price: subscriptionForm.value.price,
      description: subscriptionForm.value.description,
      featured: false, // Toujours mettre à false pour retirer la mise en avant
      features: JSON.stringify({
        level: subscriptionForm.value.level,
        days_per_month: subscriptionForm.value.daysPerMonth
      })
    };
    
    await api.post('/api/admin/subscriptions', subscriptionData);
    await fetchSubscriptionTypes();
    showAddSubscriptionModal.value = false;
    // Réinitialiser le formulaire
    subscriptionForm.value = {
      name: '',
      level: 1,
      price: 0,
      daysPerMonth: 30,
      description: '',
      featured: false
    };
  } catch (err) {
    error.value = 'Erreur lors de l\'ajout du type d\'abonnement';
    console.error(err);
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

// Éditer un abonnement utilisateur
function editUserSubscription(subscription) {
  selectedUserSubscription.value = { ...subscription };
  userSubscriptionForm.value = {
    subscriptionTypeId: subscription.subscriptionType.id.toString(),
    startDate: subscription.startDate.split('T')[0],
    expiryDate: subscription.expiryDate.split('T')[0],
    price: subscription.price
  };
  showEditUserSubscriptionModal.value = true;
}

// Confirmer l'annulation d'un abonnement utilisateur
function confirmCancelSubscription(subscription) {
  selectedUserSubscription.value = subscription;
  showCancelUserSubscriptionModal.value = true;
}

// Annuler un abonnement utilisateur
async function cancelUserSubscription() {
  if (!selectedUserSubscription.value) return;
  
  try {
    // Utiliser la même URL que celle utilisée pour récupérer les abonnements utilisateur
    await api.delete(`/api/admin/user-subscriptions/${selectedUserSubscription.value.id}`);
    await fetchUserSubscriptions();
    showCancelUserSubscriptionModal.value = false;
    selectedUserSubscription.value = null;
  } catch (err) {
    userSubscriptionsError.value = 'Erreur lors de l\'annulation de l\'abonnement';
    console.error(err);
  }
}

// Soumettre le formulaire d'abonnement utilisateur
async function submitUserSubscriptionForm() {
  try {
    // Trouver le type d'abonnement sélectionné pour obtenir son prix
    const selectedType = subscriptionTypes.value.find(
      type => type.id.toString() === userSubscriptionForm.value.subscriptionTypeId.toString()
    );

    if (!selectedType) {
      userSubscriptionsError.value = 'Type d\'abonnement invalide';
      return;
    }
    
    // Formater les données pour l'API
    const formData = {
      subscriptionTypeId: parseInt(userSubscriptionForm.value.subscriptionTypeId),
      startDate: userSubscriptionForm.value.startDate,
      expiryDate: userSubscriptionForm.value.expiryDate,
      price: selectedType.price // Utiliser le prix du type d'abonnement
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

    // Trouver le type d'abonnement sélectionné pour obtenir son prix
    const selectedType = subscriptionTypes.value.find(
      type => type.id.toString() === newUserSubscriptionForm.value.subscriptionTypeId.toString()
    );

    if (!selectedType) {
      userSubscriptionsError.value = 'Type d\'abonnement invalide';
      return;
    }

    // Formater les données pour l'API
    const formData = {
      userId: parseInt(newUserSubscriptionForm.value.userId),
      subscriptionTypeId: parseInt(newUserSubscriptionForm.value.subscriptionTypeId),
      startDate: newUserSubscriptionForm.value.startDate,
      expiryDate: newUserSubscriptionForm.value.expiryDate,
      price: selectedType.price // Utiliser le prix du type d'abonnement
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
