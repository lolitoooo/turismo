import apiClient from './api.service';

// Cache pour les abonnements
const subscriptionsCache = {
  value: null
};

/**
 * Récupère tous les abonnements disponibles depuis la base de données
 * @returns {Promise<Array>} Liste des abonnements
 */
export async function getSubscriptions() {
  try {
    // Utiliser le cache si disponible
    if (subscriptionsCache.value) {
      return subscriptionsCache.value;
    }
    
    // Récupérer les abonnements depuis l'API
    const response = await apiClient.get('/api/subscriptions');
    
    // Vérifier que la réponse contient des données
    if (!response || !response.data || !response.data.subscriptions) {
      console.error('API des abonnements non disponible ou format de réponse incorrect');
      throw new Error('Impossible de récupérer les abonnements');
    }
    
    // Les données sont déjà formatées par le backend, on les utilise directement
    const subscriptions = response.data.subscriptions;
    
    // Vérification des données reçues
    if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
      console.error('Les données d\'abonnements reçues sont invalides:', subscriptions);
      throw new Error('Format de données d\'abonnements invalide');
    }
    
    // Log pour debug
    console.log('Abonnements reçus du backend:', subscriptions);
    
    // Mettre en cache les abonnements pour les futures requêtes
    subscriptionsCache.value = subscriptions;
    return subscriptions;
  } catch (error) {
    console.error('Erreur lors de la récupération des abonnements:', error);
    throw error; // Propager l'erreur pour que l'interface puisse l'afficher
  }
}

/**
 * Récupère un abonnement par son ID
 * @param {number} id - ID de l'abonnement
 * @returns {Promise<Object|null>} Détails de l'abonnement ou null si non trouvé
 */
export async function getSubscriptionById(id) {
  try {
    const subscriptions = await getSubscriptions();
    console.log('Abonnements reçus:', subscriptions);
    // Convertir l'ID en nombre pour la comparaison
    const numericId = parseInt(id, 10);
    console.log('Recherche de l\'abonnement avec ID:', numericId);
    return subscriptions.find(subscription => subscription.id === numericId) || null;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'abonnement ${id}:`, error);
    return null;
  }
}

/**
 * Souscrit à un abonnement
 * @param {number} subscriptionId - ID de l'abonnement
 * @param {Object} userData - Données utilisateur pour la souscription
 * @returns {Promise<Object>} Résultat de la souscription
 */
export async function subscribeToSubscription(subscriptionId, userData) {
  try {
    // Récupérer l'ID utilisateur et le token depuis le localStorage
    const userJson = localStorage.getItem('user');
    const authToken = localStorage.getItem('token');
    
    if (!userJson || !authToken) {
      console.warn('Token d\'authentification manquant ou utilisateur non trouvé dans le localStorage');
      console.log('Tentative d\'utilisation des données utilisateur fournies:', userData);
      
      // Si userData contient les informations nécessaires, on les utilise
      if (userData && userData.userId) {
        console.log('Utilisation de l\'ID utilisateur fourni dans userData:', userData.userId);
        // On continue avec les données fournies
      } else {
        throw new Error('Utilisateur non connecté et données insuffisantes');
      }
    }
    
    // Si userJson existe, l'utiliser pour récupérer l'ID utilisateur
    let userId = null;
    if (userJson) {
      const user = JSON.parse(userJson);
      userId = user.id;
    } else if (userData && userData.userId) {
      // Sinon, utiliser l'ID utilisateur des données fournies
      userId = userData.userId;
      console.log('Utilisation de l\'ID utilisateur des données fournies:', userId);
    } else {
      throw new Error('Impossible de déterminer l\'ID utilisateur');
    }
    
    // Configuration des headers avec le token d'authentification
    const config = {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    };
    
    console.log('Envoi de la requête avec token:', authToken ? 'Token présent' : 'Token manquant');
    
    // Appeler l'API pour enregistrer l'abonnement
    const response = await apiClient.post('/api/userSubscription/user/subscription', {
      userId,
      subscriptionId,
      userData
    }, config);
    
    // Si l'API n'est pas disponible, simuler une réponse réussie
    if (!response || !response.data) {
      console.warn('API d\'abonnement non disponible, simulation d\'une réponse réussie');
      
      // Créer un abonnement simulé
      const subscription = await getSubscriptionById(subscriptionId);
      const activeSubscription = saveActiveSubscription(subscription);
      
      return {
        success: true,
        message: 'Souscription réussie (mode simulation)',
        subscriptionId,
        startDate: activeSubscription.startDate,
        endDate: activeSubscription.expiryDate
      };
    }
    
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la souscription à l'abonnement ${subscriptionId}:`, error);
    throw error;
  }
}

/**
 * Annule un abonnement
 * @param {number} subscriptionId - ID de l'abonnement
 * @returns {Promise<Object>} Résultat de l'annulation
 */
export async function cancelSubscription(subscriptionId) {
  try {
    // Récupérer l'ID utilisateur et le token depuis le localStorage
    const userJson = localStorage.getItem('user');
    const authToken = localStorage.getItem('token');
    
    if (!userJson || !authToken) {
      throw new Error('Utilisateur non connecté');
    }
    
    const user = JSON.parse(userJson);
    const userId = user.id;
    
    // Configuration des headers avec le token d'authentification
    const config = {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    };
    
    // Appeler l'API pour annuler l'abonnement
    try {
      const response = await apiClient.delete(`/api/userSubscription/user/${userId}/subscription`, config);
      
      // Supprimer l'abonnement actif du localStorage
      localStorage.removeItem('activeSubscription');
      
      return response.data;
    } catch (apiError) {
      console.warn('API d\'annulation non disponible, simulation d\'une réponse réussie:', apiError);
      
      // Supprimer l'abonnement actif du localStorage
      localStorage.removeItem('activeSubscription');
      
      // Simuler une réponse réussie
      return {
        success: true,
        message: 'Abonnement annulé avec succès (mode simulation)',
        subscriptionId,
        cancellationDate: new Date().toISOString()
      };
    }
  } catch (error) {
    console.error(`Erreur lors de l'annulation de l'abonnement ${subscriptionId}:`, error);
    throw error;
  }
}

/**
 * Vérifie si l'utilisateur a un abonnement actif
 * @returns {boolean} true si l'utilisateur a un abonnement actif, false sinon
 */
export function hasActiveSubscription() {
  // Récupérer l'abonnement depuis le localStorage
  const activeSubscription = localStorage.getItem('activeSubscription');
  if (!activeSubscription) return false;
  
  try {
    const subscription = JSON.parse(activeSubscription);
    // Vérifier si l'abonnement est toujours valide (non expiré)
    if (subscription && new Date(subscription.expiryDate) > new Date()) {
      return true;
    }
    // Si expiré, supprimer du localStorage
    localStorage.removeItem('activeSubscription');
    return false;
  } catch (e) {
    console.error('Erreur lors de la vérification de l\'abonnement:', e);
    return false;
  }
}

/**
 * Récupère l'abonnement actif de l'utilisateur
 * @returns {Object|null} Détails de l'abonnement actif ou null si aucun
 */
export function getActiveSubscription() {
  const activeSubscription = localStorage.getItem('activeSubscription');
  if (!activeSubscription) return null;
  
  try {
    const subscription = JSON.parse(activeSubscription);
    if (subscription && new Date(subscription.expiryDate) > new Date()) {
      return subscription;
    }
    localStorage.removeItem('activeSubscription');
    return null;
  } catch (e) {
    console.error('Erreur lors de la récupération de l\'abonnement:', e);
    return null;
  }
}

/**
 * Enregistre un abonnement actif pour l'utilisateur
 * @param {Object} subscription - Détails de l'abonnement
 * @param {number} durationMonths - Durée de l'abonnement en mois
 */
export function saveActiveSubscription(subscription, durationMonths = 1) {
  const startDate = new Date();
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
  
  const activeSubscription = {
    ...subscription,
    startDate: startDate.toISOString(),
    expiryDate: expiryDate.toISOString()
  };
  
  localStorage.setItem('activeSubscription', JSON.stringify(activeSubscription));
  return activeSubscription;
}
