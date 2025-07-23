<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">Tableau de bord</h1>
        <p class="dashboard-subtitle">Gérez vos réservations et votre profil</p>
      </div>
    </div>
    
    <div class="dashboard-content">
      <!-- Section Profil -->
      <div class="dashboard-section profile-section">
        <div class="user-profile-card">
          <div class="profile-header">
            <div class="profile-avatar" :style="profileAvatarStyle" v-if="profileImageUrl || userInitials">
              <span v-if="!profileImageUrl">{{ userInitials }}</span>
            </div>
            <div class="profile-details">
              <h2>{{ user?.firstName || '' }} {{ user?.lastName || 'Utilisateur' }}</h2>
              <p class="user-role">{{ user?.role?.name || 'Client' }}</p>
              <p class="user-email">{{ user?.email || '' }}</p>
            </div>
          </div>
          
          <div class="profile-stats">
            <div class="stat-item">
              <div class="stat-value">{{ userReservationsCount }}</div>
              <div class="stat-label">Réservations</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ profileCompletionPercentage }}%</div>
              <div class="stat-label">Profil complété</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ daysUntilSubscriptionEnd }}</div>
              <div class="stat-label">Jours restants</div>
            </div>
          </div>
          
          <div class="profile-actions">
            <button class="btn-primary" @click="goToProfile">
              <i class="pi pi-user-edit"></i> Modifier mon profil
            </button>
          </div>
        </div>
      </div>
      
      <!-- Section Statistiques -->
      <div class="dashboard-section stats-section">
        <div class="section-header">
          <h2>Aperçu</h2>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <i class="pi pi-calendar"></i>
            </div>
            <div class="stat-content">
              <h3>Prochaine réservation</h3>
              <p v-if="nextReservation">{{ nextReservation }}</p>
              <p v-else class="empty-state">Aucune réservation à venir</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <i class="pi pi-car"></i>
            </div>
            <div class="stat-content">
              <h3>Véhicule préféré</h3>
              <p v-if="favoriteVehicle">{{ favoriteVehicle }}</p>
              <p v-else class="empty-state">Aucun véhicule loué</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <i class="pi pi-credit-card"></i>
            </div>
            <div class="stat-content">
              <h3>Abonnement</h3>
              <p v-if="subscriptionStore.hasActiveSubscription" class="subscription-active">
                {{ subscriptionStore.activeSubscription?.name || 'Abonnement actif' }}
                <span class="subscription-days">({{ subscriptionStore.remainingDays }} jours restants)</span>
              </p>
              <p v-else class="empty-state">Aucun abonnement actif</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">
              <i class="pi pi-id-card"></i>
            </div>
            <div class="stat-content">
              <h3>Permis de conduire</h3>
              <p v-if="user?.driverLicenseVerified" class="verified">Vérifié</p>
              <p v-else-if="user?.driverLicenseNumber" class="pending">En attente de vérification</p>
              <p v-else class="empty-state">Non renseigné</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Section Activité récente -->
      <div class="dashboard-section activity-section">
        <div class="section-header">
          <h2>Activité récente</h2>
        </div>
        
        <div class="activity-timeline">
          <div class="timeline-item" v-if="recentActivities.length > 0" v-for="(activity, index) in recentActivities" :key="index">
            <div class="timeline-icon">
              <i :class="activity.icon"></i>
            </div>
            <div class="timeline-content">
              <h4>{{ activity.title }}</h4>
              <p>{{ activity.description }}</p>
              <span class="timeline-date">{{ activity.date }}</span>
            </div>
          </div>
          
          <div class="empty-timeline" v-if="recentActivities.length === 0">
            <p class="empty-state">Aucune activité récente à afficher</p>
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
import axios from 'axios';

const router = useRouter();
const authStore = useAuthStore();
const subscriptionStore = useSubscriptionStore();
const user = computed(() => authStore.user);

// Données pour les statistiques
const userReservationsCount = ref(0);
const profileCompletionPercentage = ref(0);
const daysUntilSubscriptionEnd = ref(0);
const nextReservation = ref(null);
const favoriteVehicle = ref(null);
const recentActivities = ref([]);

// URL de l'image de profil
const profileImageUrl = computed(() => {
  if (user.value?.profileImage) {
    // Utiliser le chemin correct pour accéder aux images de profil
    return `/api/images/profile/${user.value.profileImage}`;
  }
  return null;
});

// Initiales de l'utilisateur pour l'avatar par défaut
const userInitials = computed(() => {
  if (user.value?.firstName && user.value?.lastName) {
    return `${user.value.firstName.charAt(0)}${user.value.lastName.charAt(0)}`;
  } else if (user.value?.firstName) {
    return user.value.firstName.charAt(0);
  } else if (user.value?.lastName) {
    return user.value.lastName.charAt(0);
  }
  return 'U';
});

// Style pour l'avatar
const profileAvatarStyle = computed(() => {
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
    fontSize: '1.5rem',
    fontWeight: 'bold'
  };
});

// Calcul du pourcentage de complétion du profil
onMounted(async () => {
  // Charger les données utilisateur au montage du composant
  try {
    await authStore.fetchCurrentUser();
    calculateProfileCompletion();
    calculateSubscriptionDays();
    fetchUserReservations();
  } catch (error) {
    console.error('Erreur lors du chargement des données utilisateur:', error);
  }
});

function calculateProfileCompletion() {
  if (!user.value) return;
  
  const fields = [
    'firstName', 'lastName', 'email', 'phone', 'address',
    'city', 'postalCode', 'country', 'driverLicenseNumber'
  ];
  
  const completedFields = fields.filter(field => !!user.value[field]);
  profileCompletionPercentage.value = Math.round((completedFields.length / fields.length) * 100);
}

async function calculateSubscriptionDays() {
  try {
    // Utiliser le store d'abonnement pour récupérer l'abonnement actif
    await subscriptionStore.fetchActiveSubscription();
    
    // Utiliser le getter du store pour obtenir le nombre de jours restants
    daysUntilSubscriptionEnd.value = subscriptionStore.remainingDays;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'abonnement actif:', error);
    daysUntilSubscriptionEnd.value = 0;
  }
}

async function fetchUserReservations() {
  try {
    // Utiliser apiClient du service API pour une meilleure gestion des erreurs et de l'authentification
    const apiClient = (await import('../services/api.service')).default;
    
    const response = await apiClient.get('/api/reservations/user');
    
    if (response.data && response.data.reservations) {
      // Mettre à jour le compteur de réservations
      userReservationsCount.value = response.data.reservations.length;
      console.log(`Nombre de réservations récupérées: ${userReservationsCount.value}`);
      
      // Trouver la prochaine réservation
      const now = new Date();
      const upcomingReservations = response.data.reservations
        .filter(res => new Date(res.startDate) > now)
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
      
      if (upcomingReservations.length > 0) {
        const next = upcomingReservations[0];
        const startDate = new Date(next.startDate).toLocaleDateString('fr-FR');
        nextReservation.value = `${next.car.brand} ${next.car.model} - ${startDate}`;
      }
      
      // Trouver le véhicule préféré
      const carCounts = {};
      response.data.reservations.forEach(res => {
        const carId = res.car.id;
        carCounts[carId] = (carCounts[carId] || 0) + 1;
      });
      
      let maxCount = 0;
      let favoriteCar = null;
      
      Object.keys(carCounts).forEach(carId => {
        if (carCounts[carId] > maxCount) {
          maxCount = carCounts[carId];
          favoriteCar = response.data.reservations.find(res => res.car.id === parseInt(carId)).car;
        }
      });
      
      if (favoriteCar) {
        favoriteVehicle.value = `${favoriteCar.brand} ${favoriteCar.model}`;
      }
      
      // Activités récentes
      const recentReservations = response.data.reservations
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);
      
      recentActivities.value = recentReservations.map(res => ({
        icon: 'pi pi-calendar-plus',
        title: 'Réservation créée',
        description: `${res.car.brand} ${res.car.model} du ${new Date(res.startDate).toLocaleDateString('fr-FR')} au ${new Date(res.endDate).toLocaleDateString('fr-FR')}`,
        date: new Date(res.createdAt).toLocaleDateString('fr-FR')
      }));
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
  }
}

function goToProfile() {
  router.push('/profile');
}
</script>

<style lang="scss" scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.dashboard-header {
  margin-bottom: 2.5rem;
  position: relative;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  
  .header-content {
    max-width: 800px;
  }
  
  .dashboard-title {
    font-family: 'Playfair Display', serif;
    font-size: 2.5rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 0.5rem;
    letter-spacing: -0.5px;
  }
  
  .dashboard-subtitle {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 0;
  }
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.dashboard-section {
  margin-bottom: 1rem;
  
  .section-header {
    margin-bottom: 1.5rem;
    
    h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0;
    }
  }
}

// Section Profil
.profile-section {
  .user-profile-card {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
    padding: 2rem;
    
    .profile-header {
      display: flex;
      align-items: center;
      margin-bottom: 2rem;
      
      .profile-avatar {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        margin-right: 1.5rem;
        flex-shrink: 0;
        overflow: hidden;
      }
      
      .profile-details {
        h2 {
          font-size: 1.75rem;
          font-weight: 600;
          margin: 0 0 0.5rem;
          color: #1a1a1a;
        }
        
        .user-role {
          font-size: 1rem;
          color: #666;
          margin: 0 0 0.25rem;
          font-weight: 500;
        }
        
        .user-email {
          font-size: 0.95rem;
          color: #888;
          margin: 0;
        }
      }
    }
    
    .profile-stats {
      display: flex;
      justify-content: space-between;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      
      .stat-item {
        text-align: center;
        flex: 1;
        
        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 0.25rem;
        }
        
        .stat-label {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }
      }
    }
    
    .profile-actions {
      display: flex;
      justify-content: flex-end;
      
      .btn-primary {
        background-color: #1a1a1a;
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        &:hover {
          background-color: #333;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
}

// Section Statistiques
.stats-section {
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
    
    .stat-card {
      background-color: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
      padding: 1.5rem;
      display: flex;
      align-items: flex-start;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
      }
      
      .stat-icon {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background-color: rgba(0, 0, 0, 0.05);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 1rem;
        flex-shrink: 0;
        
        i {
          font-size: 1.5rem;
          color: #1a1a1a;
        }
      }
      
      .stat-content {
        flex: 1;
        
        h3 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.5rem;
          color: #666;
        }
        
        p {
          font-size: 1.1rem;
          font-weight: 500;
          margin: 0;
          color: #1a1a1a;
          
          &.empty-state {
            color: #999;
            font-style: italic;
            font-weight: normal;
            font-size: 0.95rem;
          }
          
          &.verified {
            color: #2ecc71;
          }
          
          &.pending {
            color: #f39c12;
          }
        }
      }
    }
  }
}

// Section Activité
.activity-section {
  .activity-timeline {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    padding: 1.5rem;
    
    .timeline-item {
      display: flex;
      padding-bottom: 1.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      
      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }
      
      .timeline-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.05);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 1rem;
        flex-shrink: 0;
        
        i {
          font-size: 1.2rem;
          color: #1a1a1a;
        }
      }
      
      .timeline-content {
        flex: 1;
        
        h4 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 0.5rem;
          color: #1a1a1a;
        }
        
        p {
          font-size: 0.95rem;
          margin: 0 0 0.5rem;
          color: #666;
        }
        
        .timeline-date {
          font-size: 0.85rem;
          color: #999;
          display: block;
        }
      }
    }
    
    .empty-timeline {
      padding: 2rem 0;
      text-align: center;
      
      .empty-state {
        color: #999;
        font-style: italic;
      }
    }
  }
}

// Responsive
@media (max-width: 768px) {
  .profile-section .user-profile-card .profile-header {
    flex-direction: column;
    text-align: center;
    
    .profile-avatar {
      margin-right: 0;
      margin-bottom: 1rem;
    }
  }
  
  .profile-section .user-profile-card .profile-stats {
    flex-direction: column;
    gap: 1rem;
    
    .stat-item {
      padding: 0.5rem 0;
    }
  }
  
  .stats-section .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
