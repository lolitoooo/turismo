const { User, SubscriptionType } = require('../models');
const logger = require('../utils/logger');
const config = require('../config');

/**
 * Contrôleur pour la gestion des paiements Stripe
 */
const paymentController = {
  /**
   * Création d'une session de paiement Stripe
   */
  createCheckoutSession: async (req, res, next) => {
    try {
      const { subscriptionId, userId, email } = req.body;
      
      // Vérification de l'existence du type d'abonnement
      const subscriptionType = await SubscriptionType.findByPk(subscriptionId);
      if (!subscriptionType) {
        return res.status(404).json({ message: 'Type d\'abonnement non trouvé' });
      }
      
      // Dans un environnement réel, nous utiliserions l'API Stripe pour créer une session
      // const stripe = require('stripe')(config.stripe.secretKey);
      // const session = await stripe.checkout.sessions.create({...});
      
      // Pour l'instant, nous simulons la création d'une session
      const sessionId = 'cs_test_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Enregistrer la session dans la base de données pour le suivi
      // Cela permettrait de vérifier le statut plus tard
      
      res.status(200).json({
        success: true,
        sessionId,
        url: `https://checkout.stripe.com/pay/${sessionId}`
      });
    } catch (error) {
      logger.error('Erreur lors de la création de la session de paiement:', error);
      next(error);
    }
  },
  
  /**
   * Récupération d'une session de paiement Stripe
   */
  getCheckoutSession: async (req, res, next) => {
    try {
      const { sessionId } = req.params;
      
      // Dans un environnement réel, nous récupérerions la session depuis Stripe
      // const stripe = require('stripe')(config.stripe.secretKey);
      // const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      // Pour l'instant, nous simulons la récupération d'une session
      res.status(200).json({
        id: sessionId,
        url: `https://checkout.stripe.com/pay/${sessionId}`,
        success: true
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération de la session de paiement:', error);
      next(error);
    }
  },
  
  /**
   * Vérification du statut d'une session de paiement Stripe
   */
  checkSessionStatus: async (req, res, next) => {
    try {
      const { sessionId } = req.params;
      
      // Dans un environnement réel, nous vérifierions le statut auprès de Stripe
      // const stripe = require('stripe')(config.stripe.secretKey);
      // const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      // Pour l'instant, nous simulons un statut réussi
      res.status(200).json({
        id: sessionId,
        status: 'complete',
        customer: {
          email: req.user ? req.user.email : 'client@example.com'
        },
        payment_intent: {
          status: 'succeeded'
        }
      });
    } catch (error) {
      logger.error('Erreur lors de la vérification du statut de la session:', error);
      next(error);
    }
  },
  
  /**
   * Webhook Stripe pour la gestion des événements de paiement
   */
  handleWebhook: async (req, res, next) => {
    try {
      const sig = req.headers['stripe-signature'];
      const event = req.body;
      
      // Dans un environnement réel, nous vérifierions la signature
      // const stripe = require('stripe')(config.stripe.secretKey);
      // const event = stripe.webhooks.constructEvent(req.body, sig, config.stripe.webhookSecret);
      
      // Traitement des différents types d'événements
      switch (event.type) {
        case 'checkout.session.completed':
          // Traitement d'une session de paiement réussie
          await handleSuccessfulPayment(event.data.object);
          break;
          
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          // Traitement des mises à jour d'abonnement
          await handleSubscriptionUpdate(event.data.object);
          break;
          
        default:
          console.log(`Événement Stripe non géré: ${event.type}`);
      }
      
      res.status(200).json({ received: true });
    } catch (error) {
      logger.error('Erreur lors du traitement du webhook Stripe:', error);
      next(error);
    }
  }
};

/**
 * Traitement d'un paiement réussi
 * @param {Object} session - Session Stripe
 */
async function handleSuccessfulPayment(session) {
  try {
    // Récupérer les métadonnées de la session
    const { userId, subscriptionId } = session.metadata || {};
    
    if (!userId || !subscriptionId) {
      logger.error('Métadonnées manquantes dans la session Stripe');
      return;
    }
    
    // Récupérer l'utilisateur et le type d'abonnement
    const user = await User.findByPk(userId);
    const subscriptionType = await SubscriptionType.findByPk(subscriptionId);
    
    if (!user || !subscriptionType) {
      logger.error('Utilisateur ou type d\'abonnement non trouvé');
      return;
    }
    
    // Calculer les dates de début et de fin d'abonnement
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (subscriptionType.durationDays || 30));
    
    // Mettre à jour l'abonnement de l'utilisateur
    await user.update({
      subscriptionTypeId: subscriptionId,
      subscriptionStartDate: startDate,
      subscriptionEndDate: endDate
    });
    
    logger.info(`Abonnement mis à jour pour l'utilisateur ${userId}`);
  } catch (error) {
    logger.error('Erreur lors du traitement du paiement réussi:', error);
  }
}

/**
 * Traitement d'une mise à jour d'abonnement
 * @param {Object} subscription - Abonnement Stripe
 */
async function handleSubscriptionUpdate(subscription) {
  try {
    // Récupérer les métadonnées de l'abonnement
    const { userId } = subscription.metadata || {};
    
    if (!userId) {
      logger.error('Métadonnées manquantes dans l\'abonnement Stripe');
      return;
    }
    
    // Récupérer l'utilisateur
    const user = await User.findByPk(userId);
    
    if (!user) {
      logger.error('Utilisateur non trouvé');
      return;
    }
    
    // Mettre à jour le statut de l'abonnement en fonction du statut Stripe
    if (subscription.status === 'active' || subscription.status === 'trialing') {
      // L'abonnement est actif, ne rien faire
    } else if (subscription.status === 'canceled' || subscription.status === 'unpaid' || subscription.status === 'incomplete_expired') {
      // L'abonnement est annulé ou impayé, supprimer l'abonnement
      await user.update({
        subscriptionTypeId: null,
        subscriptionStartDate: null,
        subscriptionEndDate: null
      });
      
      logger.info(`Abonnement annulé pour l'utilisateur ${userId}`);
    }
  } catch (error) {
    logger.error('Erreur lors du traitement de la mise à jour d\'abonnement:', error);
  }
}

module.exports = paymentController;
