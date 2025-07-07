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
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../services/api';
import { debounce } from 'lodash';
import '@/assets/styles/profile.scss';

const authStore = useAuthStore();
const successMessage = ref('');
const addressSearch = ref('');
const addressSuggestions = ref([]);
const isSearching = ref(false);
const isUploading = ref(false);

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

// URL de l'image de profil
const profileImageUrl = computed(() => {
  if (profileData.value.profileImage) {
    // Utiliser le chemin relatif pour accéder aux images via le proxy
    return `http://localhost:3000/api/uploads/profile-images/${profileData.value.profileImage}`;
  }
  return null;
});

// Initiales de l'utilisateur pour l'avatar par défaut
const userInitials = computed(() => {
  if (profileData.value.firstName && profileData.value.lastName) {
    return `${profileData.value.firstName.charAt(0)}${profileData.value.lastName.charAt(0)}`;
  } else if (profileData.value.firstName) {
    return profileData.value.firstName.charAt(0);
  } else if (profileData.value.lastName) {
    return profileData.value.lastName.charAt(0);
  }
  return 'U';
});

// Style pour l'avatar
const profilePhotoStyle = computed(() => {
  if (profileImageUrl.value) {
    return {
      backgroundImage: `url(${profileImageUrl.value})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    };
  }
  
  // Générer une couleur basée sur les initiales
  const hash = userInitials.value.charCodeAt(0) + (userInitials.value.length > 1 ? userInitials.value.charCodeAt(1) : 0);
  const hue = hash % 360;
  return {
    backgroundColor: `hsl(${hue}, 70%, 60%)`,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem',
    fontWeight: 'bold'
  };
});

onMounted(async () => {
  try {
    // Charger les données utilisateur au montage du composant
    await authStore.fetchCurrentUser();
    
    if (authStore.user) {
      profileData.value = {
        firstName: authStore.user.firstName || '',
        lastName: authStore.user.lastName || '',
        email: authStore.user.email || '',
        phone: authStore.user.phone || '',
        address: authStore.user.address || '',
        city: authStore.user.city || '',
        postalCode: authStore.user.postalCode || '',
        country: authStore.user.country || '',
        driverLicenseNumber: authStore.user.driverLicenseNumber || '',
        latitude: authStore.user.latitude || null,
        longitude: authStore.user.longitude || null,
        profileImage: authStore.user.profileImage || null
      };
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données utilisateur:', error);
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
</script>

<style scoped>
/* Les styles sont importés depuis le fichier assets/styles/profile.scss */
</style>
