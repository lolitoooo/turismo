<template>
  <div class="checkout-page">
    <section class="checkout-section">
      <div class="container">
        <!-- Affichage du chargement -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Chargement des informations...</p>
        </div>
        
        <!-- Affichage des erreurs -->
        <div v-else-if="error" class="error-container">
          <div class="error-message">
            <h2>Erreur</h2>
            <p>{{ error }}</p>
            <button @click="$router.push('/subscriptions')" class="btn-back">Retour aux abonnements</button>
          </div>
        </div>
        
        <!-- Affichage du formulaire de paiement -->
        <div v-else class="checkout-content">
          <div class="checkout-header">
            <h1>Finaliser votre abonnement</h1>
            <p>Vous avez choisi l'abonnement <strong>{{ subscription.name }}</strong></p>
          </div>
          
          <div class="checkout-grid">
            <div class="checkout-form">
              <h2>Informations personnelles</h2>
              
              <form @submit.prevent="processPayment">
                <div class="form-group">
                  <label for="firstName">Prénom</label>
                  <input 
                    type="text" 
                    id="firstName" 
                    v-model="formData.firstName" 
                    required
                    :class="{ 'error': validationErrors.firstName }"
                  >
                  <span v-if="validationErrors.firstName" class="error-text">{{ validationErrors.firstName }}</span>
                </div>
                
                <div class="form-group">
                  <label for="lastName">Nom</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    v-model="formData.lastName" 
                    required
                    :class="{ 'error': validationErrors.lastName }"
                  >
                  <span v-if="validationErrors.lastName" class="error-text">{{ validationErrors.lastName }}</span>
                </div>
                
                <div class="form-group">
                  <label for="email">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    v-model="formData.email" 
                    required
                    :class="{ 'error': validationErrors.email }"
                  >
                  <span v-if="validationErrors.email" class="error-text">{{ validationErrors.email }}</span>
                </div>
                
                <div class="form-group">
                  <label for="phone">Téléphone</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    v-model="formData.phone" 
                    required
                    :class="{ 'error': validationErrors.phone }"
                  >
                  <span v-if="validationErrors.phone" class="error-text">{{ validationErrors.phone }}</span>
                </div>
                
                <h2>Informations de paiement</h2>
                
                <div class="stripe-info">
                  <div class="stripe-logo">
                    <img src="@/assets/images/stripe-logo.png" alt="Stripe" />
                  </div>
                  <p class="stripe-text">
                    Vous serez redirigé vers Stripe, notre partenaire de paiement sécurisé, pour finaliser votre abonnement.
                  </p>
                  <div class="payment-methods">
                    <img src="@/assets/images/payment-methods.png" alt="Méthodes de paiement" />
                  </div>
                </div>
                
                <div class="form-group checkbox">
                  <input type="checkbox" id="terms" v-model="formData.termsAccepted" required>
                  <label for="terms">J'accepte les <a href="#" @click.prevent="showTerms = true">conditions générales</a> et la <a href="#" @click.prevent="showPrivacy = true">politique de confidentialité</a></label>
                  <span v-if="validationErrors.termsAccepted" class="error-text">{{ validationErrors.termsAccepted }}</span>
                </div>
                
                <button type="submit" class="btn-pay" :disabled="processing">
                  <span v-if="processing">Redirection vers Stripe...</span>
                  <span v-else>Procéder au paiement avec Stripe</span>
                </button>
              </form>
            </div>
            
            <div class="checkout-summary">
              <h2>Résumé de votre abonnement</h2>
              
              <div class="subscription-details">
                <div class="subscription-name">{{ subscription.name }}</div>
                <div class="subscription-price">{{ subscription.price }}€ <span class="price-period">/ mois</span></div>
              </div>
              
              <div class="subscription-features">
                <div class="feature">
                  <h3>Véhicules accessibles</h3>
                  <p>{{ subscription.vehicleAccess }}</p>
                </div>
                
                <div class="feature">
                  <h3>Jours de location par mois</h3>
                  <p>{{ subscription.daysPerMonth }} jours</p>
                </div>
                
                <div class="feature">
                  <h3>Services inclus</h3>
                  <ul>
                    <li v-for="(service, index) in subscription.services" :key="index" :class="{ 'included': service.included }">
                      <i :class="service.included ? 'pi pi-check' : 'pi pi-times'"></i>
                      {{ service.name }}
                    </li>
                  </ul>
                </div>
              </div>
              
              <div class="subscription-notes">
                <p>Votre abonnement débutera dès la validation du paiement.</p>
                <p>Vous pouvez annuler à tout moment depuis votre espace client.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Modal pour les conditions générales -->
    <div v-if="showTerms" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Conditions générales</h2>
          <button class="btn-close" @click="showTerms = false">&times;</button>
        </div>
        <div class="modal-body">
          <h3>1. Objet</h3>
          <p>Les présentes conditions générales régissent l'utilisation du service d'abonnement de véhicules de luxe proposé par Turismo.</p>
          
          <h3>2. Durée de l'abonnement</h3>
          <p>L'abonnement est conclu pour une durée d'un mois, renouvelable automatiquement sauf résiliation.</p>
          
          <h3>3. Tarifs et paiement</h3>
          <p>Le prix de l'abonnement est payable mensuellement. Le prélèvement est effectué le jour de la souscription puis à chaque date anniversaire.</p>
          
          <h3>4. Résiliation</h3>
          <p>L'abonnement peut être résilié à tout moment depuis l'espace client. La résiliation prendra effet à la fin de la période en cours.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-close-modal" @click="showTerms = false">Fermer</button>
        </div>
      </div>
    </div>
    
    <!-- Modal pour la politique de confidentialité -->
    <div v-if="showPrivacy" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Politique de confidentialité</h2>
          <button class="btn-close" @click="showPrivacy = false">&times;</button>
        </div>
        <div class="modal-body">
          <h3>1. Collecte des données</h3>
          <p>Nous collectons les données personnelles nécessaires à la fourniture de nos services d'abonnement.</p>
          
          <h3>2. Utilisation des données</h3>
          <p>Les données collectées sont utilisées pour la gestion de votre compte, la facturation et l'amélioration de nos services.</p>
          
          <h3>3. Protection des données</h3>
          <p>Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données personnelles.</p>
          
          <h3>4. Droits des utilisateurs</h3>
          <p>Vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-close-modal" @click="showPrivacy = false">Fermer</button>
        </div>
      </div>
    </div>
    
    <!-- Modal de confirmation -->
    <div v-if="showConfirmation" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Abonnement confirmé</h2>
        </div>
        <div class="modal-body confirmation">
          <div class="confirmation-icon">
            <i class="pi pi-check-circle"></i>
          </div>
          <h3>Merci pour votre souscription !</h3>
          <p>Votre abonnement <strong>{{ subscription.name }}</strong> est maintenant actif.</p>
          <p>Un email de confirmation a été envoyé à <strong>{{ formData.email }}</strong>.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-primary" @click="goToDashboard">Accéder à mon espace client</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getSubscriptionById, subscribeToSubscription, saveActiveSubscription } from '@/services/subscriptionService';
import { createCheckoutSession, redirectToCheckout, checkSessionStatus } from '@/services/stripeService';
import { apiClient } from '@/services/api.service';
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'SubscriptionCheckout',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const authStore = useAuthStore()
    const subscriptionId = computed(() => parseInt(route.params.id))
    
    const subscription = ref({})
    const loading = ref(true)
    const error = ref(null)
    const processing = ref(false)
    const showTerms = ref(false)
    const showPrivacy = ref(false)
    const showConfirmation = ref(false)
    
    const formData = ref({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      termsAccepted: false
    })
    
    const validationErrors = ref({})
    
    // Charger les données de l'abonnement et pré-remplir le formulaire avec les données utilisateur
    const loadSubscription = async () => {
      loading.value = true
      error.value = null
      
      try {
        // Vérifier si l'utilisateur est connecté via le store d'authentification
        if (authStore.isAuthenticated) {
          // Si l'utilisateur n'est pas encore chargé dans le store, le récupérer
          if (!authStore.user) {
            await authStore.fetchCurrentUser()
          }
          
          // Pré-remplir le formulaire avec les données de l'utilisateur du store
          if (authStore.user) {
            formData.value = {
              ...formData.value,
              firstName: authStore.user.firstName || '',
              lastName: authStore.user.lastName || '',
              email: authStore.user.email || '',
              phone: authStore.user.phone || '',
              termsAccepted: formData.value.termsAccepted
            }
            console.log('Formulaire pré-rempli avec les données utilisateur du store:', formData.value)
          } else {
            // Fallback sur les données du localStorage si disponibles
            const userJson = localStorage.getItem('user')
            if (userJson) {
              try {
                const user = JSON.parse(userJson)
                formData.value = {
                  ...formData.value,
                  firstName: user.firstName || '',
                  lastName: user.lastName || '',
                  email: user.email || '',
                  phone: user.phone || '',
                  termsAccepted: formData.value.termsAccepted
                }
                console.log('Formulaire pré-rempli avec les données utilisateur du localStorage:', formData.value)
              } catch (parseError) {
                console.warn('Erreur lors du parsing des données utilisateur du localStorage:', parseError)
              }
            }
          }
        }
        
        // Récupérer les détails de l'abonnement
        const data = await getSubscriptionById(subscriptionId.value)
        
        if (data) {
          subscription.value = data
        } else {
          error.value = 'Abonnement non trouvé'
          router.push('/subscriptions')
        }
      } catch (err) {
        console.error('Erreur lors du chargement de l\'abonnement:', err)
        error.value = 'Une erreur est survenue lors du chargement des données'
      } finally {
        loading.value = false
      }
    }
    
    // Valider le formulaire
    const validateForm = () => {
      const errors = {}
      
      if (!formData.value.firstName.trim()) {
        errors.firstName = 'Le prénom est requis'
      }
      
      if (!formData.value.lastName.trim()) {
        errors.lastName = 'Le nom est requis'
      }
      
      if (!formData.value.email.trim()) {
        errors.email = 'L\'email est requis'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
        errors.email = 'L\'email n\'est pas valide'
      }
      
      if (!formData.value.phone.trim()) {
        errors.phone = 'Le téléphone est requis'
      }
      
      if (!formData.value.termsAccepted) {
        errors.termsAccepted = 'Vous devez accepter les conditions générales'
      }
      
      validationErrors.value = errors
      return Object.keys(errors).length === 0
    }
    
    // Traiter le paiement via Stripe
    const processPayment = async () => {
      if (!validateForm()) {
        return
      }
      
      processing.value = true
      
      try {
        // Vérifier si l'utilisateur est connecté
        const userJson = localStorage.getItem('user')
        const authToken = localStorage.getItem('token')
        
        if (!userJson || !authToken) {
          // Rediriger vers la page de connexion avec un retour à cette page
          localStorage.setItem('redirectAfterLogin', `/subscription-checkout/${subscriptionId.value}`)
          router.push('/login')
          error.value = 'Vous devez être connecté pour souscrire à un abonnement'
          processing.value = false
          return
        }
        
        const user = JSON.parse(userJson)
        
        // Créer une session de paiement Stripe
        const { sessionId } = await createCheckoutSession(subscriptionId.value, {
          firstName: formData.value.firstName,
          lastName: formData.value.lastName,
          email: formData.value.email,
          phone: formData.value.phone,
          userId: user.id
        })
        
        // Stocker les informations nécessaires dans le localStorage pour le traitement après paiement
        localStorage.setItem('lastPaymentSessionId', sessionId);
        localStorage.setItem('pendingSubscriptionId', subscriptionId.value);
        localStorage.setItem('pendingSubscriptionData', JSON.stringify({
          firstName: formData.value.firstName,
          lastName: formData.value.lastName,
          email: formData.value.email,
          phone: formData.value.phone,
          userId: user.id
        }));
        
        // Construire les URLs de redirection
        const successUrl = `${window.location.origin}/payment/success`;
        const cancelUrl = `${window.location.origin}/subscriptions/${subscriptionId.value}/checkout`;
        
        // Rediriger vers la page de paiement Stripe avec les options de redirection
        // Cette fonction va rediriger l'utilisateur vers Stripe, donc le code suivant ne sera pas exécuté
        await redirectToCheckout(sessionId, { successUrl, cancelUrl })
        
        // Le code ci-dessous ne sera jamais exécuté en raison de la redirection
        // Il est conservé pour référence
        
        // Dans un environnement réel, le traitement post-paiement serait géré par:
        // 1. Un webhook Stripe qui met à jour la base de données
        // 2. Une page de retour après paiement qui vérifie le statut et met à jour l'interface utilisateur
        
      } catch (err) {
        console.error('Erreur lors du traitement du paiement:', err)
        error.value = 'Une erreur est survenue lors du traitement du paiement'
        processing.value = false
      }
    }
    
    // Rediriger vers le tableau de bord
    const goToDashboard = () => {
      router.push('/dashboard')
    }
    
    onMounted(() => {
      loadSubscription()
    })
    
    return {
      subscription,
      loading,
      error,
      processing,
      formData,
      validationErrors,
      showTerms,
      showPrivacy,
      showConfirmation,
      processPayment,
      goToDashboard
    }
  }
}
</script>

<style lang="scss" scoped>
.checkout-page {
  min-height: 100vh;
  background-color: #f9f9f9;
}

.checkout-section {
  padding: 4rem 0;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
}

.checkout-content {
  .checkout-header {
    text-align: center;
    margin-bottom: 3rem;
    
    h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }
    
    p {
      font-size: 1.2rem;
      color: #666;
    }
  }
  
  .checkout-grid {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 2rem;
    
    @media (max-width: 992px) {
      grid-template-columns: 1fr;
    }
  }
  
  .checkout-form {
    background-color: white;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    
    .stripe-info {
      background-color: #f8fafc;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      text-align: center;
      border: 1px solid #e2e8f0;
      
      .stripe-logo {
        margin-bottom: 1rem;
        
        img {
          height: 40px;
        }
      }
      
      .stripe-text {
        color: #64748b;
        font-size: 0.95rem;
        line-height: 1.5;
        margin-bottom: 1rem;
      }
      
      .payment-methods {
        margin-top: 1rem;
        
        img {
          height: 30px;
        }
      }
    }
    
    h2 {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #eee;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
      
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }
      
      input[type="text"],
      input[type="email"],
      input[type="tel"] {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        
        &.error {
          border-color: #d32f2f;
        }
      }
      
      .error-text {
        color: #d32f2f;
        font-size: 0.85rem;
        margin-top: 0.25rem;
        display: block;
      }
      
      &.checkbox {
        display: flex;
        align-items: flex-start;
        
        input {
          margin-top: 0.25rem;
          margin-right: 0.5rem;
        }
        
        label {
          margin-bottom: 0;
          font-weight: normal;
          
          a {
            color: #1a1a1a;
            text-decoration: underline;
          }
        }
      }
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    
    .btn-pay {
      width: 100%;
      padding: 1rem;
      background-color: #1a1a1a;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1.1rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.3s;
      
      &:hover {
        background-color: #333;
      }
      
      &:disabled {
        background-color: #999;
        cursor: not-allowed;
      }
    }
  }
  
  .checkout-summary {
    background-color: white;
    border-radius: 8px;
    padding: 2rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    align-self: start;
    
    h2 {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #eee;
    }
    
    .subscription-details {
      margin-bottom: 1.5rem;
      
      .subscription-name {
        font-size: 1.2rem;
        font-weight: 600;
        margin-bottom: 0.5rem;
      }
      
      .subscription-price {
        font-size: 1.8rem;
        font-weight: 700;
        
        .price-period {
          font-size: 1rem;
          font-weight: 400;
          color: #666;
        }
      }
    }
    
    .subscription-features {
      .feature {
        margin-bottom: 1.5rem;
        
        h3 {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }
        
        p {
          color: #666;
        }
        
        ul {
          list-style: none;
          padding: 0;
          
          li {
            display: flex;
            align-items: center;
            margin-bottom: 0.5rem;
            color: #666;
            
            i {
              margin-right: 0.5rem;
              font-size: 1rem;
            }
            
            &.included {
              color: #333;
              font-weight: 500;
              
              i {
                color: #43a047;
              }
            }
            
            &:not(.included) {
              opacity: 0.7;
              
              i {
                color: #d32f2f;
              }
            }
          }
        }
      }
    }
    
    .subscription-notes {
      padding-top: 1.5rem;
      border-top: 1px solid #eee;
      
      p {
        font-size: 0.9rem;
        color: #666;
        margin-bottom: 0.5rem;
      }
    }
  }
}

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
  
  .modal-content {
    background-color: white;
    border-radius: 8px;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    
    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #eee;
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      h2 {
        margin: 0;
        font-size: 1.5rem;
      }
      
      .btn-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
        
        &:hover {
          color: #333;
        }
      }
    }
    
    .modal-body {
      padding: 1.5rem;
      
      h3 {
        font-size: 1.2rem;
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
        
        &:first-child {
          margin-top: 0;
        }
      }
      
      p {
        margin-bottom: 1rem;
        line-height: 1.6;
        color: #666;
      }
      
      &.confirmation {
        text-align: center;
        
        .confirmation-icon {
          font-size: 4rem;
          color: #43a047;
          margin-bottom: 1rem;
        }
        
        h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }
        
        p {
          font-size: 1.1rem;
        }
      }
    }
    
    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid #eee;
      text-align: right;
      
      .btn-close-modal {
        padding: 0.75rem 1.5rem;
        background-color: #f5f5f5;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        
        &:hover {
          background-color: #e0e0e0;
        }
      }
      
      .btn-primary {
        padding: 0.75rem 1.5rem;
        background-color: #1a1a1a;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        
        &:hover {
          background-color: #333;
        }
      }
    }
  }
}

.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  
  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #1a1a1a;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error-message {
    text-align: center;
    
    h2 {
      color: #d32f2f;
      margin-bottom: 0.5rem;
    }
    
    p {
      margin-bottom: 1rem;
    }
    
    .btn-back {
      padding: 0.75rem 1.5rem;
      background-color: #1a1a1a;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
      
      &:hover {
        background-color: #333;
      }
    }
  }
}
</style>
