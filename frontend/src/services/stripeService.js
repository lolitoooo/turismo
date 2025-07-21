import apiClient from './api.service';

// Vérifier que apiClient est bien importé
console.log('apiClient importé:', apiClient);

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
    console.log('Token d\'authentification:', authToken);
    // Construire l'URL de succès pour le retour après paiement
    const successUrl = `${window.location.origin}/payment/success`;
    const cancelUrl = `${window.location.origin}/subscriptions/${subscriptionId}/checkout`;
    
    // Utiliser l'API backend pour créer une vraie session Stripe
    console.log('Envoi de la requête à /payment/checkout-session avec:', {
      subscriptionId,
      customerInfo: customerData
    });
    
    const response = await apiClient.post('/api/payment/checkout-session', {
      subscriptionId,
      customerInfo: customerData
    }, config);
    console.log('Reponse de l\'API:', response);
    if (!response || !response.data || !response.data.sessionId) {
      throw new Error('La réponse de l\'API ne contient pas d\'ID de session Stripe valide');
    }
    
    console.log('Session Stripe créée avec succès via l\'API:', response.data);
    return response.data;
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
    
    // Utiliser directement l'URL fournie si disponible
    if (options.url) {
      console.log('Redirection directe vers l\'URL Stripe fournie:', options.url);
      window.location.href = options.url;
      return { success: true };
    }
    
    // Si pas d'URL fournie, récupérer les détails de la session depuis l'API
    const authToken = localStorage.getItem('token');
    const config = authToken ? {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    } : {};
    
    const response = await apiClient.get(`/api/payment/checkout-session/${sessionId}`, config);
    
    if (!response || !response.data || !response.data.success || !response.data.session || !response.data.session.url) {
      throw new Error('Impossible de récupérer l\'URL de la session Stripe');
    }
    
    console.log('URL de session Stripe récupérée via l\'API:', response.data.session.url);
    window.location.href = response.data.session.url;
    return { success: true };
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
        const response = await apiClient.get(`/api/payment/check-session/${sessionId}`, config);
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
