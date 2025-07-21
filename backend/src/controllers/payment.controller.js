const { User, SubscriptionType, Subscription, Payment } = require('../models');
const logger = require('../utils/logger');

// Vérifier que la clé secrète Stripe est définie
if (!process.env.STRIPE_SECRET_KEY) {
  logger.error('STRIPE_SECRET_KEY n\'est pas définie dans les variables d\'environnement');
  throw new Error('STRIPE_SECRET_KEY manquante dans les variables d\'environnement');
}

// Initialiser Stripe avec la clé secrète
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Contrôleur pour la gestion des paiements Stripe
 */
const paymentController = {
  /**
   * Création d'une session de paiement Stripe
   */
  createCheckoutSession: async (req, res, next) => {
    try {
      // Vérifier si l'utilisateur est authentifié (via le middleware authenticateJWT)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Utilisateur non authentifié'
        });
      }
      
      const { subscriptionId, customerInfo } = req.body;
      
      if (!subscriptionId) {
        return res.status(400).json({
          success: false,
          message: 'ID d\'abonnement requis'
        });
      }
      console.log('ID d\'abonnement:', subscriptionId);
      console.log('Utilisateur authentifié:', req.user.id);
      // Vérification de l'existence du type d'abonnement
      const subscriptionType = await SubscriptionType.findByPk(subscriptionId);
      if (!subscriptionType) {
        return res.status(404).json({ 
          success: false,
          message: 'Type d\'abonnement non trouvé' 
        });
      }
      
      // Définir les URLs de redirection après paiement
      const successUrl = `${process.env.FRONTEND_URL || 'http://localhost:8082'}/payment/success`;
      const cancelUrl = `${process.env.FRONTEND_URL || 'http://localhost:8082'}/subscriptions/${subscriptionId}/checkout`;
      
      // Créer la session de paiement Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `Abonnement ${subscriptionType.name}`,
                description: subscriptionType.description || 'Abonnement mensuel Turismo',
              },
              unit_amount: Math.round(subscriptionType.price * 100), // Stripe utilise les centimes
              recurring: {
                interval: 'month',
                interval_count: 1,
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          subscriptionId: subscriptionType.id,
          userId: customerInfo?.userId,
        },
        customer_email: customerInfo?.email,
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
      });
      
      res.status(200).json({
        success: true,
        sessionId: session.id,
        url: session.url
      });
    } catch (error) {
      logger.error('Erreur lors de la création de la session de paiement:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la création de la session de paiement',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },
  
  /**
   * Récupération d'une session de paiement Stripe
   */
  getCheckoutSession: async (req, res, next) => {
    try {
      const { sessionId } = req.params;
      
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'ID de session requis'
        });
      }
      
      // Récupérer la session depuis Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      res.status(200).json({
        success: true,
        session: {
          id: session.id,
          url: session.url,
          status: session.status,
          customer_email: session.customer_email,
          amount_total: session.amount_total,
          currency: session.currency,
          payment_status: session.payment_status,
          metadata: session.metadata
        }
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération de la session de paiement:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la session de paiement',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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
      let event;
      
      // Vérifier la signature du webhook si le secret est configuré
      if (process.env.STRIPE_WEBHOOK_SECRET) {
        try {
          event = stripe.webhooks.constructEvent(
            req.rawBody || req.body, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
          );
        } catch (err) {
          logger.error(`Erreur de signature webhook: ${err.message}`);
          return res.status(400).send(`Webhook Error: ${err.message}`);
        }
      } else {
        // Fallback si le secret n'est pas configuré (mode développement uniquement)
        event = req.body;
        logger.warn('STRIPE_WEBHOOK_SECRET non configuré, la vérification de signature est désactivée');
      }
      
      // Traitement des différents types d'événements
      switch (event.type) {
        case 'checkout.session.completed':
          // Traitement d'une session de paiement réussie
          await paymentController.handleSuccessfulPayment(event.data.object);
          break;
          
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          // Traitement des mises à jour d'abonnement
          await paymentController.handleSubscriptionUpdate(event.data.object);
          break;
          
        default:
          console.log(`Événement Stripe non géré: ${event.type}`);
      }
      
      res.status(200).json({ received: true });
    } catch (error) {
      logger.error('Erreur lors du traitement du webhook Stripe:', error);
      next(error);
    }
  },
  
  /**
   * Traitement d'un paiement réussi
   * @param {Object} session - Session Stripe
   */
  handleSuccessfulPayment: async (session) => {
    try {
      // Récupérer les métadonnées de la session
      const { subscriptionId, userId } = session.metadata || {};
      
      logger.info(`Traitement du paiement réussi - Session ID: ${session.id}, User ID: ${userId}, Subscription Type ID: ${subscriptionId}`);
      
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
      
      logger.info(`Création d'un enregistrement de paiement pour l'utilisateur ${userId}`);
      // 1. Créer un enregistrement de paiement
      const payment = await Payment.create({
        amount: subscriptionType.price,
        paymentType: 'subscription',
        paymentMethod: 'card', // Stripe utilise des cartes par défaut
        transactionId: session.payment_intent || session.id,
        status: 'completed',
        paymentDate: new Date(),
        // Stocker les informations complètes du paiement pour la facture
        paymentDetails: JSON.stringify({
          stripeSessionId: session.id,
          customerEmail: session.customer_email,
          customerName: session.customer_details?.name,
          amountTotal: session.amount_total / 100, // Convertir les centimes en euros
          currency: session.currency,
          paymentMethod: session.payment_method_types?.[0] || 'card',
          paymentStatus: session.payment_status,
          invoiceId: session.invoice,
          subscriptionId: session.subscription,
          createdAt: new Date(session.created * 1000).toISOString(),
          metadata: session.metadata
        })
      });
      
      logger.info(`Création d'un enregistrement d'abonnement pour l'utilisateur ${userId} avec type ${subscriptionId}`);
      // 2. Créer un enregistrement d'abonnement
      const subscription = await Subscription.create({
        userId: userId,
        subscriptionTypeId: subscriptionId,
        startDate: startDate,
        expiryDate: endDate,
        status: 'active',
        autoRenew: true, // Par défaut à oui comme demandé
        paymentId: payment.id
      });
      
      logger.info(`Mise à jour du paiement ${payment.id} avec l'ID d'abonnement ${subscription.id}`);
      // 3. Mettre à jour le paiement avec l'ID de l'abonnement
      await payment.update({
        subscriptionId: subscription.id
      });
      
      logger.info(`Mise à jour de l'utilisateur ${userId} avec les informations d'abonnement (type: ${subscriptionId}, début: ${startDate}, fin: ${endDate})`);
      // 4. Mettre à jour l'utilisateur avec les informations d'abonnement
      await user.update({
        subscriptionTypeId: subscriptionId,
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate
      });
      
      logger.info(`Abonnement créé avec succès pour l'utilisateur ${userId}, ID: ${subscription.id}, paiement ID: ${payment.id}`);
      logger.info(`L'utilisateur ${userId} a maintenant accès aux véhicules de la catégorie ${subscriptionId} et inférieures`);
      return { subscription, payment };
    } catch (error) {
      logger.error('Erreur lors du traitement du paiement réussi:', error);
      throw error;
    }
  },
  
  /**
   * Traitement d'une mise à jour d'abonnement
   * @param {Object} subscription - Abonnement Stripe
   */
  handleSubscriptionUpdate: async (subscription) => {
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
};



module.exports = paymentController;
