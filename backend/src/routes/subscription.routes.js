const express = require('express');
const { body, param } = require('express-validator');
const subscriptionController = require('../controllers/subscription.controller');
const { authenticateJWT } = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

// Routes publiques
// Obtenir tous les types d'abonnements
router.get('/', subscriptionController.getAllSubscriptionTypes);

// Routes utilisateur (doivent être définies avant les routes avec des paramètres génériques)
// Obtenir l'abonnement actif d'un utilisateur
router.get(
  '/user/:userId/active',
  [
    param('userId').isInt().withMessage('ID utilisateur invalide'),
    validateRequest
  ],
  subscriptionController.getUserActiveSubscription
);

// Obtenir l'abonnement d'un utilisateur (pour compatibilité avec le store Pinia)
router.get(
  '/user/:userId/subscription',
  [
    param('userId').isInt().withMessage('ID utilisateur invalide'),
    validateRequest
  ],
  subscriptionController.getUserActiveSubscription
);

// Obtenir un type d'abonnement par ID (doit être après les routes spécifiques)
router.get(
  '/:id',
  [
    param('id').isInt().withMessage('ID de type d\'abonnement invalide'),
    validateRequest
  ],
  subscriptionController.getSubscriptionTypeById
);

// Routes protégées
router.use(authenticateJWT);

// Créer un nouveau type d'abonnement (admin uniquement)
router.post(
  '/',
  [
    roleMiddleware(['admin']),
    body('name').notEmpty().withMessage('Le nom est requis'),
    body('price').isFloat({ min: 0 }).withMessage('Prix invalide'),
    body('durationDays').isInt({ min: 1 }).withMessage('Durée invalide'),
    validateRequest
  ],
  subscriptionController.createSubscriptionType
);

// Mettre à jour un type d'abonnement (admin uniquement)
router.put(
  '/:id',
  [
    roleMiddleware(['admin']),
    param('id').isInt().withMessage('ID de type d\'abonnement invalide'),
    validateRequest
  ],
  subscriptionController.updateSubscriptionType
);

// Supprimer un type d'abonnement (admin uniquement)
router.delete(
  '/:id',
  [
    roleMiddleware(['admin']),
    param('id').isInt().withMessage('ID de type d\'abonnement invalide'),
    validateRequest
  ],
  subscriptionController.deleteSubscriptionType
);

module.exports = router;
