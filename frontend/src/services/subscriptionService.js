import apiClient from './api.service';
import { useSubscriptionStore } from '../stores/subscription';

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
    // Utiliser le store d'abonnement
    const subscriptionStore = useSubscriptionStore();
    
    // Récupérer l'abonnement par son ID depuis le store
    return await subscriptionStore.getSubscriptionById(id);
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
      const activeSubscription = subscription;
      
      // Calculer les dates de début et de fin
      const startDate = new Date();
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1); // Abonnement d'un mois par défaut
      
      // Ajouter les dates à l'abonnement
      activeSubscription.startDate = startDate;
      activeSubscription.expiryDate = expiryDate;
      
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
 * @returns {Promise<Object>} Résultat de l'annulation
 */
export async function cancelSubscription() {
  try {
    // Utiliser le store d'abonnement
    const subscriptionStore = useSubscriptionStore();
    
    // Appeler la méthode du store pour annuler l'abonnement
    return await subscriptionStore.cancelSubscription();
  } catch (error) {
    console.error(`Erreur lors de l'annulation de l'abonnement:`, error);
    throw error;
  }
}

/**
 * Prépare un objet d'abonnement avec les dates appropriées
 * @param {Object} subscription - Détails de l'abonnement
 * @param {number} durationMonths - Durée de l'abonnement en mois
 * @returns {Object|null} L'objet d'abonnement actif avec dates ou null en cas d'erreur
 * @deprecated Cette fonction est dépréciée. Utilisez le store d'abonnement à la place.
 */
export function prepareSubscriptionDates(subscription, durationMonths = 1) {
  try {
    if (!subscription) return null;
    
    // Calculer la date d'expiration
    const startDate = new Date();
    const expiryDate = new Date(startDate);
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
    
    // Créer l'objet d'abonnement avec dates
    return {
      ...subscription,
      startDate: startDate.toISOString(),
      expiryDate: expiryDate.toISOString()
    };
  } catch (error) {
    console.error('Erreur lors de la préparation de l\'objet d\'abonnement:', error);
    return null;
  }
}

/**
 * Vérifie si l'utilisateur a un abonnement actif en interrogeant l'API
 * @returns {Promise<boolean>} true si l'utilisateur a un abonnement actif, false sinon
 */
export async function hasActiveSubscription() {
  try {
    // Utiliser le store d'abonnement
    const subscriptionStore = useSubscriptionStore();
    
    // Récupérer l'abonnement actif depuis le store
    await subscriptionStore.fetchActiveSubscription();
    
    // Utiliser le getter du store pour vérifier si l'abonnement est actif
    return subscriptionStore.hasActiveSubscription;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'abonnement:', error);
    return false;
  }
}

/**
 * Récupère l'abonnement actif de l'utilisateur directement depuis l'API
 * @returns {Promise<Object|null>} Détails de l'abonnement actif ou null si aucun
 */
export async function getActiveSubscription() {
  try {
    // Utiliser le store d'abonnement
    const subscriptionStore = useSubscriptionStore();
    
    // Récupérer l'abonnement actif depuis le store
    return await subscriptionStore.fetchActiveSubscription();
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'abonnement depuis l\'API:', error);
    return null;
  }
}
