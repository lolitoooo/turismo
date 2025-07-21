const express = require('express');
const router = express.Router();
const userSubscriptionController = require('../controllers/userSubscription.controller');
const { authenticateJWT } = require('../middlewares/auth');

/**
 * Routes pour la gestion des abonnements utilisateur
 */

// Souscrire à un abonnement
router.post('/user/subscription', authenticateJWT, userSubscriptionController.subscribeUser);

// Récupérer l'abonnement d'un utilisateur
router.get('/user/:userId/subscription', authenticateJWT, userSubscriptionController.getUserSubscription);

// Annuler l'abonnement d'un utilisateur
router.delete('/user/:userId/subscription', authenticateJWT, userSubscriptionController.cancelUserSubscription);

module.exports = router;
