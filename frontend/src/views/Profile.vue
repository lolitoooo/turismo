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
        
        <!-- Section Mes Réservations -->
        <div class="profile-section reservations-section">
          <div class="section-header">
            <h2>Mes Réservations</h2>
          </div>
          
          <div v-if="loadingReservations" class="loading-container">
            <div class="spinner"></div>
            <p>Chargement de vos réservations...</p>
          </div>
          
          <div v-else-if="reservations.length > 0" class="reservations-list">
            <div v-for="reservation in reservations" :key="reservation.id" class="reservation-card">
              <div class="reservation-header">
                <h3>{{ reservation.car ? `${reservation.car.brand} ${reservation.car.model}` : 'Véhicule' }}</h3>
                <div class="reservation-status" :class="getReservationStatusClass(reservation.status)">
                  {{ getReservationStatusText(reservation.status) }}
                </div>
              </div>
              
              <div class="reservation-details">
                <div class="reservation-detail">
                  <span class="detail-label">Dates:</span>
                  <span class="detail-value">{{ formatDate(reservation.startDate) }} - {{ formatDate(reservation.endDate) }}</span>
                </div>
                <div class="reservation-detail">
                  <span class="detail-label">Durée:</span>
                  <span class="detail-value">{{ calculateDuration(reservation.startDate, reservation.endDate) }} jours</span>
                </div>
                <div class="reservation-detail">
                  <span class="detail-label">Lieu de prise en charge:</span>
                  <span class="detail-value">{{ reservation.pickupLocation }}</span>
                </div>
                <div class="reservation-detail">
                  <span class="detail-label">Lieu de retour:</span>
                  <span class="detail-value">{{ reservation.returnLocation }}</span>
                </div>
                <div v-if="reservation.specialRequests" class="reservation-detail">
                  <span class="detail-label">Demandes spéciales:</span>
                  <span class="detail-value">{{ reservation.specialRequests }}</span>
                </div>
                <div class="reservation-detail">
                  <span class="detail-label">Prix total:</span>
                  <span class="detail-value">{{ reservation.totalPrice }}€</span>
                </div>
              </div>
              
              <div class="reservation-actions">
                <button 
                  v-if="canCancelReservation(reservation)" 
                  @click="cancelReservation(reservation.id)" 
                  class="btn-cancel-reservation"
                >
                  Annuler la réservation
                </button>
              </div>
            </div>
          </div>
          
          <div v-else class="no-reservations">
            <p>Vous n'avez pas encore de réservations.</p>
            <router-link to="/cars" class="btn-browse-cars">Parcourir les véhicules</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useSubscriptionStore } from '../stores/subscription';
import apiClient from '../services/api.service';
import reservationService from '../services/reservationService';
import { checkSessionStatus } from '@/services/stripeService';
import '@/assets/styles/profile.scss';

const router = useRouter();
const authStore = useAuthStore();
const subscriptionStore = useSubscriptionStore();
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

// Réservations
const reservations = ref([]);
const loadingReservations = ref(false);
const cancellingReservation = ref(false);

// Données d'abonnement
const activeSubscription = computed(() => subscriptionStore.activeSubscription);

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
      }
      
      // Récupérer l'abonnement actif de l'utilisateur
      await subscriptionStore.fetchActiveSubscription();
      console.log('Abonnement actif récupéré:', subscriptionStore.activeSubscription);
      
      // Récupérer les réservations de l'utilisateur
      fetchUserReservations();
    }
  } catch (error) {
    console.error('Erreur lors du chargement du profil:', error);
  }
});

// Fonction de recherche d'adresse avec debounce pour limiter les appels API
const searchAddresses = async () => {
  if (!addressSearch.value || addressSearch.value.length < 3) {
    addressSuggestions.value = [];
    return;
  }
  
  isSearching.value = true;
  try {
    const response = await apiClient.get('/api/address/search', {
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
};

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
    
    const response = await apiClient.post('/api/upload/profile-image', formData, {
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
  if (confirm('Êtes-vous sûr de vouloir annuler votre abonnement ? Cette action est irréversible.')) {
    try {
      const result = await subscriptionStore.cancelSubscription();
      
      if (result && result.success) {
        // Mettre à jour les données utilisateur
        await authStore.fetchCurrentUser();
        
        // Afficher un message de succès
        successMessage.value = 'Votre abonnement a été annulé avec succès.';
        
        // Masquer le message après quelques secondes
        setTimeout(() => {
          successMessage.value = '';
        }, 5000);
      }
    } catch (error) {
      console.error('Erreur lors de l\'annulation de l\'abonnement:', error);
    }
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

// Fonction pour calculer la durée entre deux dates en jours
function calculateDuration(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Fonction pour récupérer les réservations de l'utilisateur
async function fetchUserReservations() {
  loadingReservations.value = true;
  try {
    reservations.value = await reservationService.getUserReservations();
    console.log('Réservations récupérées:', reservations.value);
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
  } finally {
    loadingReservations.value = false;
  }
}

// Fonction pour annuler une réservation
async function cancelReservation(reservationId) {
  if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ? Cette action est irréversible.')) {
    cancellingReservation.value = true;
    try {
      await reservationService.cancelReservation(reservationId);
      
      // Mettre à jour la liste des réservations
      await fetchUserReservations();
      
      // Afficher un message de succès
      successMessage.value = 'Votre réservation a été annulée avec succès.';
      
      // Masquer le message après quelques secondes
      setTimeout(() => {
        successMessage.value = '';
      }, 5000);
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la réservation:', error);
    } finally {
      cancellingReservation.value = false;
    }
  }
}

// Fonction pour vérifier si une réservation peut être annulée
function canCancelReservation(reservation) {
  if (!reservation || !reservation.startDate) return false;
  
  // On ne peut annuler que les réservations à venir (pas les réservations passées ou en cours)
  const today = new Date();
  const startDate = new Date(reservation.startDate);
  
  // On peut annuler si la date de début est dans le futur
  return startDate > today && reservation.status !== 'cancelled';
}

// Fonction pour obtenir la classe CSS en fonction du statut de la réservation
function getReservationStatusClass(status) {
  switch (status) {
    case 'confirmed':
      return 'status-confirmed';
    case 'pending':
      return 'status-pending';
    case 'cancelled':
      return 'status-cancelled';
    case 'completed':
      return 'status-completed';
    default:
      return '';
  }
}

// Fonction pour obtenir le texte du statut de la réservation
function getReservationStatusText(status) {
  switch (status) {
    case 'confirmed':
      return 'Confirmée';
    case 'pending':
      return 'En attente';
    case 'cancelled':
      return 'Annulée';
    case 'completed':
      return 'Terminée';
    default:
      return status;
  }
}
</script>

<style scoped>
/* Les styles sont importés depuis le fichier assets/styles/profile.scss */
</style>
