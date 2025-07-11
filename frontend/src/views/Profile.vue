<template>
  <div class="profile-page">
    <div class="profile-container">
      <div class="profile-header">
        <h1>Mon Profil</h1>
        <p class="subtitle">Gérez vos informations personnelles</p>
      </div>
      
      <div v-if="authStore.loading" class="loading-container">
        <div class="spinner"></div>
      </div>
      
      <div v-else class="profile-content">
        <div class="alert success" v-if="successMessage">
          <i class="pi pi-check-circle"></i>
          {{ successMessage }}
        </div>
        <div class="alert error" v-if="authStore.error">
          <i class="pi pi-times-circle"></i>
          {{ authStore.error }}
        </div>
        
        <div class="profile-grid">
          <!-- Section Abonnement -->
          <div class="profile-section subscription-section">
            <div class="section-header">
              <h2>Mon Abonnement</h2>
            </div>
            
            <div v-if="activeSubscription" class="subscription-info">
              <div class="subscription-header" :class="activeSubscription.name.toLowerCase()">
                <h3>{{ activeSubscription.name }}</h3>
                <div class="subscription-badge">Actif</div>
              </div>
              
              <div class="subscription-details">
                <div class="subscription-detail">
                  <span class="detail-label">Prix mensuel:</span>
                  <span class="detail-value">{{ activeSubscription.price }}€</span>
                </div>
                <div class="subscription-detail">
                  <span class="detail-label">Jours de location:</span>
                  <span class="detail-value">{{ activeSubscription.daysPerMonth }} jours/mois</span>
                </div>
                <div class="subscription-detail">
                  <span class="detail-label">Accès véhicules:</span>
                  <span class="detail-value">{{ activeSubscription.vehicleAccess }}</span>
                </div>
                <div class="subscription-detail">
                  <span class="detail-label">Date d'expiration:</span>
                  <span class="detail-value">{{ formatDate(activeSubscription.expiryDate) }}</span>
                </div>
              </div>
              
              <div class="subscription-actions">
                <button @click="cancelSubscription" class="btn-cancel">Annuler l'abonnement</button>
              </div>
            </div>
            
            <div v-else class="no-subscription">
              <p>Vous n'avez pas d'abonnement actif.</p>
              <p>Sans abonnement, vous ne pouvez pas réserver de véhicules.</p>
              <router-link to="/subscriptions" class="btn-subscribe">Voir les abonnements</router-link>
            </div>
          </div>
          
          <!-- Section Photo de profil -->
          <div class="profile-section photo-section">
            <div class="section-header">
              <h2>Photo de profil</h2>
            </div>
            
            <div class="profile-photo-container">
              <div class="profile-photo" :style="profilePhotoStyle">
                <span v-if="!profileImageUrl">{{ userInitials }}</span>
              </div>
              
              <div class="photo-actions">
                <label for="profile-photo-upload" class="btn-upload">
                  <i class="pi pi-camera"></i> Changer la photo
                </label>
                <input 
                  type="file" 
                  id="profile-photo-upload" 
                  accept="image/*" 
                  @change="handlePhotoUpload"
                  class="hidden-input"
                />
                
                <button 
                  v-if="profileData.profileImage" 
                  type="button" 
                  class="btn-remove" 
                  @click="removeProfilePhoto"
                >
                  <i class="pi pi-trash"></i> Supprimer
                </button>
              </div>
            </div>
          </div>
          
          <!-- Section Informations personnelles -->
          <div class="profile-section info-section">
            <div class="section-header">
              <h2>Informations personnelles</h2>
            </div>
            
            <form @submit.prevent="updateProfile">
                
              <div class="form-row">
                <div class="form-group">
                  <label for="firstName">Prénom</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    v-model="profileData.firstName" 
                    required
                  />
                </div>
                <div class="form-group">
                  <label for="lastName">Nom</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    v-model="profileData.lastName" 
                    required
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label for="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  v-model="profileData.email" 
                  required
                  disabled
                />
                <div class="form-text">L'email ne peut pas être modifié.</div>
              </div>
              
              <div class="form-group">
                <label for="phone">Téléphone</label>
                <input 
                  type="tel" 
                  id="phone" 
                  v-model="profileData.phone"
                />
              </div>
              
              <div class="form-group">
                <label for="address">Adresse</label>
                <div class="address-container">
                  <input 
                    type="text" 
                    id="address" 
                    v-model="addressSearch"
                    @input="searchAddresses"
                    placeholder="Commencez à taper votre adresse..."
                    autocomplete="off"
                  />
                  <div v-if="addressSuggestions.length > 0" class="address-suggestions">
                    <div 
                      v-for="(suggestion, index) in addressSuggestions" 
                      :key="index"
                      class="suggestion-item"
                      @click="selectAddress(suggestion)"
                    >
                      {{ suggestion.label }}
                    </div>
                  </div>
                </div>
                <textarea 
                  id="fullAddress" 
                  v-model="profileData.address"
                  rows="2"
                  placeholder="Adresse complète"
                  class="mt-2"
                ></textarea>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="city">Ville</label>
                  <input 
                    type="text" 
                    id="city" 
                    v-model="profileData.city"
                  />
                </div>
                <div class="form-group">
                  <label for="postalCode">Code Postal</label>
                  <input 
                    type="text" 
                    id="postalCode" 
                    v-model="profileData.postalCode"
                  />
                </div>
              </div>
              
              <div class="form-group">
                <label for="country">Pays</label>
                <input 
                  type="text" 
                  id="country" 
                  v-model="profileData.country"
                />
              </div>
              
              <div class="form-group">
                <label for="driverLicenseNumber">Numéro de Permis de Conduire</label>
                <input 
                  type="text" 
                  id="driverLicenseNumber" 
                  v-model="profileData.driverLicenseNumber"
                />
              </div>
              
              <div class="form-actions">
                <button type="submit" class="btn-primary" :disabled="authStore.loading || isUploading">
                  <span v-if="authStore.loading" class="spinner"></span>
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';
import { debounce } from 'lodash';
import { getActiveSubscription, cancelSubscription as cancelUserSubscription, getSubscriptionById } from '@/services/subscriptionService';
import { apiClient } from '@/services/api.service';
import { checkSessionStatus } from '@/services/stripeService';
import '@/assets/styles/profile.scss';

const authStore = useAuthStore();
const profileData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: '',
  driverLicenseNumber: '',
  latitude: null,
  longitude: null,
  profileImage: null
});

const successMessage = ref('');
const addressSearch = ref('');
const addressSuggestions = ref([]);
const isSearching = ref(false);
const isUploading = ref(false);
const profileImageUrl = ref('');
const activeSubscription = ref(null);

// Style pour la photo de profil
const profilePhotoStyle = computed(() => {
  if (profileImageUrl.value) {
    return {
      backgroundImage: `url(${profileImageUrl.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }
  return {};
});

// Fonction pour récupérer les détails de l'abonnement depuis le backend
async function fetchSubscriptionDetails(subscriptionId) {
  try {
    // Essayer d'abord de récupérer depuis l'API
    const response = await apiClient.get(`/api/subscriptions/${subscriptionId}`);
    if (response && response.data) {
      return response.data;
    }
    
    // Si l'API échoue, utiliser le service local
    return await getSubscriptionById(subscriptionId);
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de l\'abonnement:', error);
    // Fallback sur le service local
    return await getSubscriptionById(subscriptionId);
  }
}

// Fonction pour vérifier si le paiement a été validé pour l'abonnement
async function checkPaymentValidation(userData) {
  try {
    // Vérifier si l'utilisateur a des informations d'abonnement
    if (!userData || !userData.subscription) {
      return false;
    }
    
    // Récupérer le sessionId du paiement depuis le localStorage
    const paymentSessionId = localStorage.getItem('lastPaymentSessionId');
    
    if (!paymentSessionId) {
      // Si aucun sessionId n'est trouvé, vérifier si l'abonnement a des dates valides
      // Cela signifie que l'abonnement a été validé précédemment
      return !!(userData.subscription.startDate && userData.subscription.expiryDate);
    }
    
    // Vérifier le statut du paiement auprès de Stripe
    try {
      const sessionStatus = await checkSessionStatus(paymentSessionId);
      
      // Si le statut est 'complete', le paiement a été validé
      if (sessionStatus && sessionStatus.status === 'complete') {
        return true;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du statut de paiement:', error);
      // En cas d'erreur, vérifier si l'abonnement a des dates valides
      return !!(userData.subscription.startDate && userData.subscription.expiryDate);
    }
    
    return false;
  } catch (error) {
    console.error('Erreur lors de la vérification de la validation du paiement:', error);
    return false;
  }
}

// Charger les données du profil au chargement du composant
onMounted(async () => {
  try {
    // Si l'utilisateur est connecté, récupérer ses données
    if (authStore.isAuthenticated) {
      const userData = await authStore.fetchCurrentUser();
      
      if (userData) {
        profileData.value = { ...userData };
        
        // Initialiser la recherche d'adresse avec l'adresse actuelle
        if (profileData.value.address) {
          addressSearch.value = profileData.value.address;
        }
        
        // Gérer l'image de profil
        if (profileData.value.profileImage) {
          profileImageUrl.value = `/api/images/profile/${profileData.value.profileImage}`;
        }
        
        // Récupérer l'abonnement actif depuis le localStorage
        const localActiveSubscription = getActiveSubscription();
        
        // Vérifier si un paiement a été validé pour l'abonnement
        const paymentValidated = await checkPaymentValidation(userData);
        
        // Ne pas afficher d'abonnement si le paiement n'a pas été validé
        if (!paymentValidated) {
          activeSubscription.value = null;
        }
        // Si le paiement a été validé et l'utilisateur a un abonnement
        else if (userData.subscription && userData.subscription.id) {
          // Récupérer les détails complets de l'abonnement
          const subscriptionDetails = await fetchSubscriptionDetails(userData.subscription.id);
          if (subscriptionDetails) {
            activeSubscription.value = {
              ...subscriptionDetails,
              startDate: userData.subscription.startDate,
              expiryDate: userData.subscription.expiryDate
            };
          } else {
            activeSubscription.value = null;
          }
        } else {
          activeSubscription.value = null;
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors du chargement du profil:', error);
  }
});

// Fonction de recherche d'adresse avec debounce pour limiter les appels API
const searchAddresses = debounce(async () => {
  if (!addressSearch.value || addressSearch.value.length < 3) {
    addressSuggestions.value = [];
    return;
  }
  
  isSearching.value = true;
  try {
    const response = await api.get('/api/address/search', {
      params: { q: addressSearch.value }
    });
    
    if (response.data && response.data.addresses) {
      addressSuggestions.value = response.data.addresses;
    }
  } catch (error) {
    console.error('Erreur lors de la recherche d\'adresses:', error);
    addressSuggestions.value = [];
  } finally {
    isSearching.value = false;
  }
}, 300);

// Fonction pour sélectionner une adresse dans les suggestions
function selectAddress(suggestion) {
  addressSearch.value = suggestion.label;
  profileData.value.address = suggestion.label;
  profileData.value.city = suggestion.city || '';
  profileData.value.postalCode = suggestion.postcode || '';
  profileData.value.country = 'France';
  profileData.value.latitude = suggestion.latitude;
  profileData.value.longitude = suggestion.longitude;
  
  // Fermer les suggestions
  addressSuggestions.value = [];
}

// Fonction pour gérer l'upload de photo de profil
async function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Vérifier le type de fichier
  if (!file.type.startsWith('image/')) {
    authStore.setError('Le fichier doit être une image');
    return;
  }
  
  // Vérifier la taille du fichier (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    authStore.setError('L\'image ne doit pas dépasser 5MB');
    return;
  }
  
  isUploading.value = true;
  
  try {
    const formData = new FormData();
    formData.append('profileImage', file);
    
    const response = await api.post('/api/upload/profile-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    if (response.data && response.data.success) {
      // Mettre à jour l'image de profil dans les données locales
      profileData.value.profileImage = response.data.profileImage.split('/').pop();
      
      // Mettre à jour l'utilisateur dans le store
      await authStore.fetchCurrentUser();
      
      successMessage.value = 'Photo de profil mise à jour avec succès';
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    }
  } catch (error) {
    console.error('Erreur lors de l\'upload de la photo de profil:', error);
    authStore.setError('Erreur lors de l\'upload de la photo de profil');
  } finally {
    isUploading.value = false;
  }
}

// Fonction pour supprimer la photo de profil
async function removeProfilePhoto() {
  if (!profileData.value.profileImage) return;
  
  isUploading.value = true;
  
  try {
    // Mettre à jour le profil avec profileImage = null
    const updatedProfile = { ...profileData.value, profileImage: null };
    await authStore.updateProfile(updatedProfile);
    
    // Mettre à jour les données locales
    profileData.value.profileImage = null;
    
    successMessage.value = 'Photo de profil supprimée avec succès';
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error) {
    console.error('Erreur lors de la suppression de la photo de profil:', error);
    authStore.setError('Erreur lors de la suppression de la photo de profil');
  } finally {
    isUploading.value = false;
  }
}

async function updateProfile() {
  try {
    await authStore.updateProfile(profileData.value);
    successMessage.value = 'Profil mis à jour avec succès';
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
  }
}

// Fonction pour annuler l'abonnement
async function cancelSubscription() {
  if (!activeSubscription.value) return;
  
  try {
    // Appeler le service d'annulation
    const result = await cancelUserSubscription(activeSubscription.value.id);
    
    if (result.success) {
      // Mettre à jour l'interface
      activeSubscription.value = null;
      
      // Mettre à jour les données utilisateur dans le localStorage
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        // Supprimer les informations d'abonnement
        user.subscription = null;
        localStorage.setItem('user', JSON.stringify(user));
        
        // Mettre à jour le store d'authentification
        await authStore.fetchCurrentUser();
      }
      
      // Appeler l'API pour mettre à jour l'abonnement dans la base de données
      try {
        await apiClient.delete(`/api/user/subscription`);
      } catch (apiError) {
        console.warn('API d\'annulation d\'abonnement non disponible:', apiError);
        // Continuer même si l'API échoue - l'annulation locale a fonctionné
      }
      
      // Afficher un message de succès
      successMessage.value = 'Votre abonnement a été annulé avec succès';
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    }
  } catch (error) {
    console.error('Erreur lors de l\'annulation de l\'abonnement:', error);
    authStore.setError('Erreur lors de l\'annulation de l\'abonnement');
  }
}

// Fonction pour formater une date
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  }).format(date);
}
</script>

<style scoped>
/* Les styles sont importés depuis le fichier assets/styles/profile.scss */
</style>
