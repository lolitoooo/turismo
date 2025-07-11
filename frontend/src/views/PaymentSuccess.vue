<template>
  <div class="payment-success">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card shadow">
            <div class="card-body p-5">
              <div v-if="loading" class="text-center">
                <div class="spinner-border text-primary" role="status">
                  <span class="visually-hidden">Chargement...</span>
                </div>
                <p class="mt-3">Traitement de votre paiement en cours...</p>
              </div>
              
              <div v-else-if="error" class="text-center">
                <div class="alert alert-danger">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>
                  {{ error }}
                </div>
                <button @click="retryPaymentVerification" class="btn btn-primary mt-3">
                  Réessayer
                </button>
                <button @click="goToProfile" class="btn btn-outline-secondary mt-3 ms-2">
                  Aller à mon profil
                </button>
              </div>
              
              <div v-else-if="success" class="text-center">
                <div class="success-icon mb-4">
                  <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
                </div>
                <h2 class="card-title mb-4">Abonnement confirmé !</h2>
                <p class="card-text mb-4">
                  Votre abonnement <strong>{{ subscriptionName }}</strong> a été activé avec succès.
                  Vous pouvez maintenant profiter de tous les avantages de votre abonnement.
                </p>
                <div class="subscription-details mb-4 p-3 bg-light rounded">
                  <div class="row mb-2">
                    <div class="col-md-6 text-md-end fw-bold">Date de début:</div>
                    <div class="col-md-6 text-md-start">{{ formatDate(startDate) }}</div>
                  </div>
                  <div class="row">
                    <div class="col-md-6 text-md-end fw-bold">Date d'expiration:</div>
                    <div class="col-md-6 text-md-start">{{ formatDate(expiryDate) }}</div>
                  </div>
                </div>
                <div class="mt-4">
                  <button @click="goToProfile" class="btn btn-primary me-2">
                    Voir mon profil
                  </button>
                  <button @click="goToCars" class="btn btn-outline-primary">
                    Explorer les véhicules
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getSubscriptionById, subscribeToSubscription, saveActiveSubscription } from '@/services/subscriptionService';
import { checkSessionStatus } from '@/services/stripeService';
import { apiClient } from '@/services/api.service';

export default {
  name: 'PaymentSuccess',
  setup() {
    const router = useRouter();
    const loading = ref(true);
    const error = ref(null);
    const success = ref(false);
    const subscriptionName = ref('');
    const startDate = ref(null);
    const expiryDate = ref(null);

    // Formater la date pour l'affichage
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    };

    // Vérifier le statut du paiement et finaliser l'abonnement
    const verifyPaymentAndFinalizeSubscription = async () => {
      loading.value = true;
      error.value = null;
      
      try {
        // Récupérer les informations de paiement du localStorage
        const sessionId = localStorage.getItem('lastPaymentSessionId');
        const subscriptionId = localStorage.getItem('pendingSubscriptionId');
        const pendingDataJson = localStorage.getItem('pendingSubscriptionData');
        
        if (!sessionId || !subscriptionId || !pendingDataJson) {
          error.value = 'Informations de paiement manquantes. Veuillez réessayer le processus de paiement.';
          loading.value = false;
          return;
        }
        
        const pendingData = JSON.parse(pendingDataJson);
        
        // Vérifier le statut du paiement auprès de Stripe
        const sessionStatus = await checkSessionStatus(sessionId);
        
        if (!sessionStatus || sessionStatus.status !== 'complete') {
          error.value = 'Le paiement n\'a pas été validé. Veuillez réessayer.';
          loading.value = false;
          return;
        }
        
        // Enregistrer la souscription dans la base de données
        const subscriptionResult = await subscribeToSubscription(subscriptionId, pendingData);
        
        if (!subscriptionResult || !subscriptionResult.success) {
          throw new Error('Erreur lors de l\'enregistrement de l\'abonnement');
        }
        
        // Récupérer les détails de l'abonnement
        const subscriptionData = await getSubscriptionById(subscriptionId);
        
        if (!subscriptionData) {
          throw new Error('Impossible de récupérer les détails de l\'abonnement');
        }
        
        // Enregistrer l'abonnement actif dans localStorage
        const activeSubscription = saveActiveSubscription(subscriptionData);
        
        // Mettre à jour les données utilisateur avec l'abonnement
        const userJson = localStorage.getItem('user');
        
        if (userJson) {
          const user = JSON.parse(userJson);
          user.subscription = {
            id: subscriptionData.id,
            name: subscriptionData.name,
            startDate: activeSubscription.startDate,
            expiryDate: activeSubscription.expiryDate
          };
          
          // Sauvegarder les données utilisateur mises à jour
          localStorage.setItem('user', JSON.stringify(user));
        }
        
        // Mettre à jour les données d'affichage
        subscriptionName.value = subscriptionData.name;
        startDate.value = activeSubscription.startDate;
        expiryDate.value = activeSubscription.expiryDate;
        
        // Marquer comme succès
        success.value = true;
        
        // Nettoyer les données temporaires
        localStorage.removeItem('pendingSubscriptionId');
        localStorage.removeItem('pendingSubscriptionData');
      } catch (err) {
        console.error('Erreur lors de la vérification du paiement:', err);
        error.value = 'Une erreur est survenue lors de la finalisation de votre abonnement. Veuillez contacter le support.';
      } finally {
        loading.value = false;
      }
    };
    
    // Réessayer la vérification du paiement
    const retryPaymentVerification = () => {
      verifyPaymentAndFinalizeSubscription();
    };
    
    // Naviguer vers le profil
    const goToProfile = () => {
      router.push('/profile');
    };
    
    // Naviguer vers la page des véhicules
    const goToCars = () => {
      router.push('/cars');
    };
    
    // Vérifier le paiement au chargement de la page
    onMounted(() => {
      verifyPaymentAndFinalizeSubscription();
    });
    
    return {
      loading,
      error,
      success,
      subscriptionName,
      startDate,
      expiryDate,
      formatDate,
      retryPaymentVerification,
      goToProfile,
      goToCars
    };
  }
};
</script>

<style scoped>
.payment-success {
  min-height: 80vh;
  display: flex;
  align-items: center;
}

.success-icon {
  animation: scale-in 0.5s ease-out;
}

@keyframes scale-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.subscription-details {
  border-left: 4px solid #198754;
}
</style>
