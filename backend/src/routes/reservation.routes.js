const express = require('express');
const { body, param } = require('express-validator');
const reservationController = require('../controllers/reservation.controller');
const { authenticateJWT } = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

// Toutes les routes de réservation nécessitent une authentification
router.use(authenticateJWT);

// Obtenir toutes les réservations (admin et manager)
router.get(
  '/',
  roleMiddleware(['admin', 'manager']),
  reservationController.getAllReservations
);

// Obtenir les réservations de l'utilisateur connecté
router.get(
  '/my-reservations',
  reservationController.getUserReservations
);

// Obtenir une réservation par ID
router.get(
  '/:id',
  [
    param('id').isInt().withMessage('ID de réservation invalide'),
    validateRequest
  ],
  reservationController.getReservationById
);

// Créer une nouvelle réservation
router.post(
  '/',
  [
    body('carId').isInt().withMessage('ID de voiture invalide'),
    body('startDate').isISO8601().withMessage('Date de début invalide'),
    body('endDate').isISO8601().withMessage('Date de fin invalide'),
    body('pickupLocation').notEmpty().withMessage('Lieu de prise en charge requis'),
    body('returnLocation').notEmpty().withMessage('Lieu de retour requis'),
    validateRequest
  ],
  reservationController.createReservation
);

// Mettre à jour une réservation
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('ID de réservation invalide'),
    validateRequest
  ],
  reservationController.updateReservation
);

// Annuler une réservation
router.post(
  '/:id/cancel',
  [
    param('id').isInt().withMessage('ID de réservation invalide'),
    validateRequest
  ],
  reservationController.cancelReservation
);

// Payer la caution d'une réservation
router.post(
  '/:id/deposit',
  [
    param('id').isInt().withMessage('ID de réservation invalide'),
    body('paymentMethod').notEmpty().withMessage('Méthode de paiement requise'),
    validateRequest
  ],
  reservationController.payDeposit
);

// Enregistrer le début d'une location (admin et manager)
router.post(
  '/:id/start',
  [
    roleMiddleware(['admin', 'manager']),
    param('id').isInt().withMessage('ID de réservation invalide'),
    body('initialMileage').isInt({ min: 0 }).withMessage('Kilométrage initial invalide'),
    validateRequest
  ],
  reservationController.startRental
);

// Enregistrer la fin d'une location (admin et manager)
router.post(
  '/:id/end',
  [
    roleMiddleware(['admin', 'manager']),
    param('id').isInt().withMessage('ID de réservation invalide'),
    body('finalMileage').isInt({ min: 0 }).withMessage('Kilométrage final invalide'),
    validateRequest
  ],
  reservationController.endRental
);

// Ajouter un avis sur une réservation terminée
router.post(
  '/:id/review',
  [
    param('id').isInt().withMessage('ID de réservation invalide'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Note invalide (1-5)'),
    validateRequest
  ],
  reservationController.addReview
);

module.exports = router;
