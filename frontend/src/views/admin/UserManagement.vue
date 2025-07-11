<template>
  <div class="user-management">
    <div class="page-header">
      <h1>Gestion des Utilisateurs</h1>
      <div class="header-actions">
        <button class="btn-primary" @click="openAddUserModal">
          <i class="pi pi-plus"></i> Ajouter un utilisateur
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
        <label>Rôle:</label>
        <select v-model="filters.role">
          <option value="">Tous</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="customer">Client</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Statut:</label>
        <select v-model="filters.status">
          <option value="">Tous</option>
          <option value="active">Actif</option>
          <option value="inactive">Inactif</option>
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
      <button class="btn-primary" @click="fetchUsers">Réessayer</button>
    </div>

    <div v-else class="users-table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Statut</th>
            <th>Date d'inscription</th>
            <th>Abonnement</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.id }}</td>
            <td>{{ user.firstName }} {{ user.lastName }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span class="role-badge" :class="user.role.name">
                {{ formatRole(user.role.name) }}
              </span>
            </td>
            <td>
              <span class="status-badge" :class="user.isActive ? 'active' : 'inactive'">
                {{ user.isActive ? 'Actif' : 'Inactif' }}
              </span>
            </td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>
              <span v-if="user.subscription">
                {{ user.subscription.name }}
              </span>
              <span v-else class="no-subscription">Aucun</span>
            </td>
            <td class="actions">
              <button class="btn-icon" @click="editUser(user)">
                <i class="pi pi-pencil"></i>
              </button>
              <button class="btn-icon" @click="viewUserDetails(user)">
                <i class="pi pi-eye"></i>
              </button>
              <button class="btn-icon danger" @click="confirmDeleteUser(user)">
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

    <!-- Modal pour ajouter/modifier un utilisateur -->
    <div class="modal" v-if="showAddUserModal || showEditUserModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ showEditUserModal ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur' }}</h2>
          <button class="btn-close" @click="closeUserModal">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitUserForm">
            <div class="form-row">
              <div class="form-group">
                <label for="firstName">Prénom <span class="required">*</span></label>
                <input type="text" id="firstName" v-model="userForm.firstName" required />
                <div class="error-message" v-if="validationErrors.firstName">{{ validationErrors.firstName }}</div>
              </div>
              <div class="form-group">
                <label for="lastName">Nom <span class="required">*</span></label>
                <input type="text" id="lastName" v-model="userForm.lastName" required />
                <div class="error-message" v-if="validationErrors.lastName">{{ validationErrors.lastName }}</div>
              </div>
            </div>
            <div class="form-group">
              <label for="email">Email <span class="required">*</span></label>
              <input type="email" id="email" v-model="userForm.email" required />
              <div class="error-message" v-if="validationErrors.email">{{ validationErrors.email }}</div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="role">Rôle <span class="required">*</span></label>
                <select id="role" v-model="userForm.role" required>
                  <option value="">Sélectionner un rôle</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="customer">Client</option>
                </select>
                <div class="error-message" v-if="validationErrors.role">{{ validationErrors.role }}</div>
              </div>
              <div class="form-group">
                <label for="status">Statut <span class="required">*</span></label>
                <select id="status" v-model="userForm.isActive" required>
                  <option :value="true">Actif</option>
                  <option :value="false">Inactif</option>
                </select>
                <div class="error-message" v-if="validationErrors.isActive">{{ validationErrors.isActive }}</div>
              </div>
            </div>
            <div class="form-group" v-if="!showEditUserModal">
              <label for="password">Mot de passe</label>
              <input type="password" id="password" v-model="userForm.password" required />
            </div>
            <div class="form-actions">
              <button type="button" class="btn-secondary" @click="closeUserModal">Annuler</button>
              <button type="submit" class="btn-primary">
                {{ showEditUserModal ? 'Mettre à jour' : 'Ajouter' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div class="modal" v-if="showDeleteModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Confirmer la suppression</h2>
          <button class="btn-close" @click="showDeleteModal = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Êtes-vous sûr de vouloir supprimer l'utilisateur {{ selectedUser?.firstName }} {{ selectedUser?.lastName }} ?</p>
          <p class="warning">Cette action est irréversible.</p>
          <div class="form-actions">
            <button class="btn-secondary" @click="showDeleteModal = false">Annuler</button>
            <button class="btn-danger" @click="deleteUser">Supprimer</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de détails utilisateur -->
    <div class="modal" v-if="showUserDetailsModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Détails de l'utilisateur</h2>
          <button class="btn-close" @click="showUserDetailsModal = false">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="selectedUser" class="user-details">
            <div class="user-profile">
              <div class="user-avatar" :style="userAvatarStyle">
                <span v-if="!selectedUser.profileImage">{{ getUserInitials(selectedUser) }}</span>
              </div>
              <h3>{{ selectedUser.firstName }} {{ selectedUser.lastName }}</h3>
              <span class="role-badge" :class="selectedUser.role.name">
                {{ formatRole(selectedUser.role.name) }}
              </span>
            </div>
            
            <div class="details-section">
              <h4>Informations personnelles</h4>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">{{ selectedUser.email }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Téléphone:</span>
                <span class="detail-value">{{ selectedUser.phone || 'Non renseigné' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Adresse:</span>
                <span class="detail-value">{{ selectedUser.address || 'Non renseignée' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Ville:</span>
                <span class="detail-value">{{ selectedUser.city || 'Non renseignée' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Code postal:</span>
                <span class="detail-value">{{ selectedUser.postalCode || 'Non renseigné' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Pays:</span>
                <span class="detail-value">{{ selectedUser.country || 'Non renseigné' }}</span>
              </div>
            </div>

            <div class="details-section">
              <h4>Abonnement</h4>
              <div v-if="selectedUser.subscription" class="subscription-details">
                <div class="detail-row">
                  <span class="detail-label">Type:</span>
                  <span class="detail-value">{{ selectedUser.subscription.name }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Prix:</span>
                  <span class="detail-value">{{ selectedUser.subscription.price }}€/mois</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date de début:</span>
                  <span class="detail-value">{{ formatDate(selectedUser.subscription.startDate) }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date d'expiration:</span>
                  <span class="detail-value">{{ formatDate(selectedUser.subscription.expiryDate) }}</span>
                </div>
              </div>
              <div v-else class="no-subscription-details">
                <p>Cet utilisateur n'a pas d'abonnement actif.</p>
              </div>
            </div>
          </div>
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
const users = ref([]);
const loading = ref(false);
const error = ref(null);
const currentPage = ref(1);
const totalPages = ref(1);
const itemsPerPage = 10;
const validationErrors = ref({});

// Filtres
const filters = ref({
  search: '',
  role: '',
  status: ''
});

// Modals
const showAddUserModal = ref(false);
const showEditUserModal = ref(false);
const showDeleteModal = ref(false);
const showUserDetailsModal = ref(false);
const selectedUser = ref(null);
const userForm = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'customer',
  isActive: true
});

// Vérifier si l'utilisateur est admin
onMounted(async () => {
  if (!authStore.isAdmin) {
    router.push('/dashboard');
    return;
  }
  
  await fetchUsers();
});

// Récupérer la liste des utilisateurs
async function fetchUsers() {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await api.get('/api/admin/users', {
      params: {
        page: currentPage.value,
        limit: itemsPerPage
      }
    });
    
    if (response.data) {
      users.value = response.data.users;
      totalPages.value = Math.ceil(response.data.total / itemsPerPage);
    }
  } catch (err) {
    error.value = 'Erreur lors de la récupération des utilisateurs';
    console.error(err);
  } finally {
    loading.value = false;
  }
}

// Filtrer les utilisateurs
const filteredUsers = computed(() => {
  return users.value.filter(user => {
    // Filtre de recherche
    const searchMatch = filters.value.search === '' || 
      user.firstName.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.value.search.toLowerCase());
    
    // Filtre de rôle
    const roleMatch = filters.value.role === '' || user.role.name === filters.value.role;
    
    // Filtre de statut
    const statusMatch = filters.value.status === '' || 
      (filters.value.status === 'active' && user.isActive) ||
      (filters.value.status === 'inactive' && !user.isActive);
    
    return searchMatch && roleMatch && statusMatch;
  });
});

// Recherche avec debounce
const debounceSearch = debounce(() => {
  // La recherche est automatiquement appliquée via le computed filteredUsers
}, 300);

// Réinitialiser les filtres
function resetFilters() {
  filters.value = {
    search: '',
    role: '',
    status: ''
  };
}

// Changer de page
function changePage(page) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    fetchUsers();
  }
}

// Éditer un utilisateur
function editUser(user) {
  selectedUser.value = user;
  
  // Réinitialiser les erreurs de validation
  validationErrors.value = {};
  
  userForm.value = {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    role: user.role ? user.role.name : 'customer',
    isActive: user.isActive !== undefined ? user.isActive : true // Valeur par défaut si non définie
  };
  
  console.log('Formulaire prérempli pour la modification:', userForm.value);
  showEditUserModal.value = true;
}

// Voir les détails d'un utilisateur
function viewUserDetails(user) {
  selectedUser.value = user;
  showUserDetailsModal.value = true;
}

// Confirmer la suppression d'un utilisateur
function confirmDeleteUser(user) {
  selectedUser.value = user;
  showDeleteModal.value = true;
}

// Supprimer un utilisateur
async function deleteUser() {
  if (!selectedUser.value) return;
  
  try {
    await api.delete(`/api/admin/users/${selectedUser.value.id}`);
    await fetchUsers();
    showDeleteModal.value = false;
    selectedUser.value = null;
  } catch (err) {
    error.value = 'Erreur lors de la suppression de l\'utilisateur';
    console.error(err);
  }
}

// Soumettre le formulaire utilisateur
async function submitUserForm() {
  console.log('Début de la soumission du formulaire utilisateur');
  console.log('Modal actif:', showEditUserModal.value ? 'Edition' : (showAddUserModal.value ? 'Ajout' : 'Aucun'));
  
  try {
    // Réinitialiser les erreurs de validation
    validationErrors.value = {};
    error.value = null;
    
    // Valider les champs obligatoires
    let isValid = true;
    
    if (!userForm.value.firstName) {
      validationErrors.value.firstName = 'Le prénom est requis';
      isValid = false;
    }
    
    if (!userForm.value.lastName) {
      validationErrors.value.lastName = 'Le nom est requis';
      isValid = false;
    }
    
    if (!userForm.value.email) {
      validationErrors.value.email = 'L\'email est requis';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.value.email)) {
      validationErrors.value.email = 'Format d\'email invalide';
      isValid = false;
    }
    
    if (!userForm.value.role) {
      validationErrors.value.role = 'Le rôle est requis';
      isValid = false;
    }
    
    if (userForm.value.isActive === undefined) {
      validationErrors.value.isActive = 'Le statut est requis';
      isValid = false;
    }
    
    if (!showEditUserModal.value && !userForm.value.password) {
      validationErrors.value.password = 'Le mot de passe est requis';
      isValid = false;
    }
    
    // Si la validation échoue, ne pas soumettre le formulaire
    if (!isValid) {
      console.log('Validation échouée:', validationErrors.value);
      return;
    }
    
    // Afficher le chargement
    loading.value = true;
    
    if (showEditUserModal.value) {
      // Mise à jour d'un utilisateur existant
      console.log('Données envoyées pour la mise à jour:', { ...userForm.value, password: userForm.value.password ? '***' : undefined });
      const response = await api.put(`/api/admin/users/${selectedUser.value.id}`, userForm.value);
      console.log('Réponse de mise à jour:', response.data);
    } else {
      // Création d'un nouvel utilisateur
      console.log('Données envoyées pour la création:', { ...userForm.value, password: '***' });
      const response = await api.post('/api/admin/users', userForm.value);
      console.log('Réponse de création:', response.data);
    }
    
    await fetchUsers();
    closeUserModal();
  } catch (err) {
    console.error('Erreur lors de la soumission du formulaire:', err);
    
    // Gérer les erreurs spécifiques retournées par l'API
    if (err.response) {
      console.error('Détails de l\'erreur:', err.response.data);
      error.value = err.response.data.message || 'Erreur lors de l\'enregistrement de l\'utilisateur';
    } else {
      error.value = 'Erreur lors de la connexion au serveur';
    }
    
    // Afficher l'erreur dans l'interface utilisateur
    alert(`Erreur: ${error.value}`);
  } finally {
    loading.value = false;
  }
}

// Ouvrir le modal d'ajout d'utilisateur
function openAddUserModal() {
  console.log('Ouverture du modal d\'ajout d\'utilisateur');
  // Réinitialiser les erreurs de validation
  validationErrors.value = {};
  
  // Réinitialiser le formulaire
  userForm.value = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'customer',
    isActive: true
  };
  
  // Ouvrir le modal
  showAddUserModal.value = true;
}

// Fermer le modal utilisateur
function closeUserModal() {
  console.log('Fermeture du modal utilisateur');
  showAddUserModal.value = false;
  showEditUserModal.value = false;
  selectedUser.value = null;
  userForm.value = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'customer',
    isActive: true
  };
}

// Formater le rôle
function formatRole(role) {
  switch (role) {
    case 'admin':
      return 'Administrateur';
    case 'manager':
      return 'Manager';
    case 'customer':
      return 'Client';
    default:
      return role;
  }
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

// Obtenir les initiales de l'utilisateur
function getUserInitials(user) {
  if (!user) return '';
  
  const firstInitial = user.firstName ? user.firstName.charAt(0) : '';
  const lastInitial = user.lastName ? user.lastName.charAt(0) : '';
  
  return (firstInitial + lastInitial).toUpperCase();
}

// Style pour l'avatar utilisateur
const userAvatarStyle = computed(() => {
  if (selectedUser.value?.profileImage) {
    return {
      backgroundImage: `url(/api/images/profile/${selectedUser.value.profileImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }
  
  return {};
});
</script>

<style scoped>
.user-management {
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

.users-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th, .users-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.users-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.users-table tr:hover {
  background-color: #f8f9fa;
}

.role-badge, .status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.role-badge.admin {
  background-color: #EDE9FE;
  color: #6D28D9;
}

.role-badge.manager {
  background-color: #E0F2FE;
  color: #0369A1;
}

.role-badge.customer {
  background-color: #ECFDF5;
  color: #059669;
}

.status-badge.active {
  background-color: #ECFDF5;
  color: #059669;
}

.status-badge.inactive {
  background-color: #FEF2F2;
  color: #DC2626;
}

.no-subscription {
  color: #6B7280;
  font-style: italic;
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
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
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
  font-size: 1.5rem;
  cursor: pointer;
  color: #6B7280;
}

.modal-body {
  padding: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  flex: 1;
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input, .form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
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

.warning {
  color: #DC2626;
  font-weight: 500;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #3B82F6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
}

.details-section {
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
}

.details-section h4 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
}

.detail-row {
  display: flex;
  margin-bottom: 0.75rem;
}

.detail-label {
  width: 150px;
  font-weight: 500;
  color: #6B7280;
}

.detail-value {
  flex: 1;
  color: #333;
}

.no-subscription-details {
  color: #6B7280;
  font-style: italic;
}

.required {
  color: #DC2626;
  margin-left: 2px;
}

.error-message {
  color: #DC2626;
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.form-group input:invalid,
.form-group select:invalid {
  border-color: #DC2626;
}
</style>
