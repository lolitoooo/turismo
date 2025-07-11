<template>
  <div class="admin-dashboard">
    <div class="admin-header">
      <h1>Dashboard Administrateur</h1>
      <p class="subtitle">Gérez les utilisateurs, abonnements et réservations</p>
    </div>

    <div class="admin-stats">
      <div class="stat-card">
        <div class="stat-icon users">
          <i class="pi pi-users"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.userCount || 0 }}</h3>
          <p>Utilisateurs</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon subscriptions">
          <i class="pi pi-ticket"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.activeSubscriptions || 0 }}</h3>
          <p>Abonnements actifs</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon reservations">
          <i class="pi pi-calendar"></i>
        </div>
        <div class="stat-content">
          <h3>{{ stats.reservationCount || 0 }}</h3>
          <p>Réservations</p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon revenue">
          <i class="pi pi-euro"></i>
        </div>
        <div class="stat-content">
          <h3>{{ formatCurrency(stats.monthlyRevenue || 0) }}</h3>
          <p>Revenus mensuels</p>
        </div>
      </div>
    </div>

    <div class="admin-navigation">
      <router-link to="/admin/users" class="admin-nav-item">
        <i class="pi pi-users"></i>
        <span>Gestion des utilisateurs</span>
      </router-link>
      <router-link to="/admin/subscriptions" class="admin-nav-item">
        <i class="pi pi-ticket"></i>
        <span>Gestion des abonnements</span>
      </router-link>
      <router-link to="/admin/reservations" class="admin-nav-item">
        <i class="pi pi-calendar"></i>
        <span>Gestion des réservations</span>
      </router-link>
      <router-link to="/admin/cars" class="admin-nav-item">
        <i class="pi pi-car"></i>
        <span>Gestion des véhicules</span>
      </router-link>
    </div>

    <div class="admin-recent-activity">
      <h2>Activité récente</h2>
      <div class="activity-list" v-if="recentActivity.length > 0">
        <div v-for="activity in recentActivity" :key="activity.id" class="activity-item">
          <div class="activity-icon" :class="activity.type">
            <i :class="getActivityIcon(activity.type)"></i>
          </div>
          <div class="activity-details">
            <p class="activity-message">{{ activity.message }}</p>
            <p class="activity-time">{{ formatDate(activity.timestamp) }}</p>
          </div>
        </div>
      </div>
      <div v-else class="no-activity">
        <p>Aucune activité récente</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import api from '@/services/api';

const authStore = useAuthStore();
const router = useRouter();
const stats = ref({
  userCount: 0,
  activeSubscriptions: 0,
  reservationCount: 0,
  monthlyRevenue: 0
});
const recentActivity = ref([]);

// Vérifier si l'utilisateur est admin
onMounted(async () => {
  if (!authStore.isAdmin) {
    router.push('/dashboard');
    return;
  }
  
  await fetchDashboardStats();
  await fetchRecentActivity();
});

// Récupérer les statistiques du dashboard
async function fetchDashboardStats() {
  try {
    const response = await api.get('/api/admin/stats');
    if (response.data) {
      stats.value = response.data;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
  }
}

// Récupérer l'activité récente
async function fetchRecentActivity() {
  try {
    const response = await api.get('/api/admin/activity');
    if (response.data && response.data.activities) {
      recentActivity.value = response.data.activities;
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité récente:', error);
  }
}

// Formater les montants en euros
function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
}

// Formater les dates
function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// Obtenir l'icône en fonction du type d'activité
function getActivityIcon(type) {
  switch (type) {
    case 'user':
      return 'pi pi-user';
    case 'subscription':
      return 'pi pi-ticket';
    case 'reservation':
      return 'pi pi-calendar';
    case 'payment':
      return 'pi pi-credit-card';
    default:
      return 'pi pi-info-circle';
  }
}
</script>

<style scoped>
.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.admin-header {
  margin-bottom: 2rem;
  text-align: center;
}

.admin-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.admin-header .subtitle {
  font-size: 1.2rem;
  color: #666;
}

.admin-stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.stat-icon i {
  font-size: 1.8rem;
  color: white;
}

.stat-icon.users {
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
}

.stat-icon.subscriptions {
  background: linear-gradient(135deg, #10B981, #059669);
}

.stat-icon.reservations {
  background: linear-gradient(135deg, #F59E0B, #D97706);
}

.stat-icon.revenue {
  background: linear-gradient(135deg, #3B82F6, #2563EB);
}

.stat-content h3 {
  font-size: 1.8rem;
  margin: 0;
  color: #333;
}

.stat-content p {
  margin: 0;
  color: #666;
}

.admin-navigation {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.admin-nav-item {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: #333;
  transition: all 0.3s ease;
}

.admin-nav-item:hover {
  transform: translateY(-5px);
  background: #f8f9fa;
}

.admin-nav-item i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #3B82F6;
}

.admin-nav-item span {
  font-size: 1.2rem;
  font-weight: 500;
}

.admin-recent-activity {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.admin-recent-activity h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #333;
  font-size: 1.5rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  background: #f8f9fa;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.activity-icon i {
  color: white;
}

.activity-icon.user {
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
}

.activity-icon.subscription {
  background: linear-gradient(135deg, #10B981, #059669);
}

.activity-icon.reservation {
  background: linear-gradient(135deg, #F59E0B, #D97706);
}

.activity-icon.payment {
  background: linear-gradient(135deg, #3B82F6, #2563EB);
}

.activity-details {
  flex: 1;
}

.activity-message {
  margin: 0;
  color: #333;
}

.activity-time {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}

.no-activity {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>
