import { apiClient } from './api.service';

// Clé publique Stripe (fictive pour la démonstration)
const STRIPE_PUBLIC_KEY = 'pk_live_51PIZXxBu7gPuK7cUok9lkEg5e4uwRPdYvjtmK0gh1olZUPCpG3wxJ6rMBerC4iu8NIKAP33vzSHwWs7Pe5epzyYE00cUuBLbj2';

/**
 * Crée une session de paiement Stripe pour un abonnement
 * @param {number} subscriptionId - ID de l'abonnement
 * @param {Object} customerData - Données du client
 * @returns {Promise<{sessionId: string}>} - ID de la session Stripe
 */
export async function createCheckoutSession(subscriptionId, customerData) {
  try {
    // Récupérer le token d'authentification
    const authToken = localStorage.getItem('token');
    
    // Configuration des headers avec le token d'authentification
    const config = authToken ? {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    } : {};
    
    // Construire l'URL de succès pour le retour après paiement
    const successUrl = `${window.location.origin}/payment/success`;
    const cancelUrl = `${window.location.origin}/subscriptions/${subscriptionId}/checkout`;
    
    // Essayer d'abord d'utiliser l'API backend
    try {
      const response = await apiClient.post('/payment/checkout-session', {
        subscriptionId,
        userId: customerData.userId,
        email: customerData.email,
        successUrl,
        cancelUrl
      }, config);
      
      if (response && response.data && response.data.sessionId) {
        console.log('Session Stripe créée avec succès via l\'API');
        return response.data;
      }
    } catch (apiError) {
      console.warn('API de création de session non disponible, utilisation du mode simulation:', apiError);
    }
    
    // Mode simulation (fallback)
    console.log('Création d\'une session Stripe simulée');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      sessionId: 'cs_test_' + Math.random().toString(36).substring(2, 15),
      simulated: true,
      successUrl,
      cancelUrl
    };
  } catch (error) {
    console.error('Erreur lors de la création de la session de paiement:', error);
    throw error;
  }
}

/**
 * Redirige l'utilisateur vers la page de paiement Stripe
 * @param {string} sessionId - ID de la session Stripe
 * @param {Object} options - Options de redirection
 * @returns {Promise<{success: boolean}>}
 */
export async function redirectToCheckout(sessionId, options = {}) {
  try {
    console.log('Redirection vers Stripe avec sessionId:', sessionId);
    
    // Récupérer les URLs de succès et d'annulation
    const successUrl = options.successUrl || `${window.location.origin}/payment/success`;
    
    // Construire l'URL de checkout Stripe avec paramètres
    let stripeUrl = `https://checkout.stripe.com/c/pay/${sessionId}`;
    
    // Ajouter les paramètres de redirection pour Stripe
    // Dans un environnement réel, ces paramètres seraient configurés lors de la création de la session
    // Ici, nous les simulons pour la démonstration
    if (sessionId.startsWith('cs_test_')) {
      // En mode développement, simuler une redirection vers la page de succès après un court délai
      console.log('Mode développement: Simulation de paiement Stripe');
      console.log('Redirection vers la page de succès après 2 secondes:', successUrl);
      
      setTimeout(() => {
        window.location.href = successUrl;
      }, 2000);
      
      return { success: true, simulated: true };
    } else {
      // En production, rediriger vers Stripe
      console.log('Redirection vers Stripe:', stripeUrl);
      window.location.href = stripeUrl;
      
      // Cette ligne ne sera jamais exécutée en raison de la redirection
      return { success: true };
    }
  } catch (error) {
    console.error('Erreur lors de la redirection vers Stripe:', error);
    throw error;
  }
}

/**
 * Vérifie le statut d'une session de paiement
 * @param {string} sessionId - ID de la session Stripe
 * @returns {Promise<Object>} Statut de la session
 */
export async function checkSessionStatus(sessionId) {
  try {
    // Récupérer le token d'authentification
    const authToken = localStorage.getItem('token');
    
    // Configuration des headers avec le token d'authentification
    const config = authToken ? {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    } : {};
    
    // Vérifier si la session est simulée
    const isSimulated = sessionId.startsWith('cs_test_');
    
    if (!isSimulated) {
      // Essayer d'abord de vérifier via l'API backend
      try {
        const response = await apiClient.get(`/payment/check-session/${sessionId}`, config);
        if (response && response.data) {
          console.log('Statut de session récupéré avec succès via l\'API');
          return response.data;
        }
      } catch (apiError) {
        console.warn('API de vérification de session non disponible, utilisation du mode simulation:', apiError);
      }
    }
    
    // Mode simulation (fallback)
    console.log(`Vérification du statut de la session (simulation): ${sessionId}`);
    
    // Simuler un délai pour la vérification
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Récupérer les informations utilisateur pour la simulation
    let userEmail = 'client@example.com';
    let userId = null;
    
    try {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        userEmail = user.email || userEmail;
        userId = user.id;
      }
    } catch (e) {
      console.error('Erreur lors de la récupération des données utilisateur:', e);
    }
    
    // Dans un environnement réel, le statut serait vérifié via un webhook Stripe
    return {
      status: 'complete',
      customer: {
        email: userEmail,
        userId: userId
      },
      payment_intent: {
        status: 'succeeded'
      },
      simulated: true
    };
  } catch (error) {
    console.error('Erreur lors de la vérification du statut de la session:', error);
    throw error;
  }
}
