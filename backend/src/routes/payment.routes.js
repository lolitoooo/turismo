const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticateJWT } = require('../middleware/auth');

/**
 * Routes pour la gestion des paiements
 */

// Création d'une session de paiement Stripe
router.post('/payment/checkout-session', authenticateJWT, paymentController.createCheckoutSession);

// Récupération d'une session de paiement Stripe
router.get('/payment/checkout-session/:sessionId', paymentController.getCheckoutSession);

// Vérification du statut d'une session de paiement Stripe
router.get('/payment/check-session/:sessionId', paymentController.checkSessionStatus);

// Webhook Stripe pour la gestion des événements de paiement
router.post('/payment/webhook', paymentController.handleWebhook);

module.exports = router;
