const express = require('express');
const { body, param, query } = require('express-validator');
const carController = require('../controllers/car.controller');
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

// Routes publiques
// Obtenir toutes les voitures disponibles
router.get('/available', carController.getAvailableCars);

// Rechercher des voitures disponibles pour une période donnée
router.get(
  '/search',
  [
    query('startDate').optional().isISO8601().withMessage('Date de début invalide'),
    query('endDate').optional().isISO8601().withMessage('Date de fin invalide'),
    validateRequest
  ],
  carController.searchAvailableCars
);

// Obtenir une voiture par ID
router.get(
  '/:id',
  [
    param('id').isInt().withMessage('ID de voiture invalide'),
    validateRequest
  ],
  carController.getCarById
);

// Routes protégées
router.use(authMiddleware);

// Obtenir toutes les voitures (admin et manager)
router.get(
  '/',
  roleMiddleware(['admin', 'manager']),
  carController.getAllCars
);

// Créer une nouvelle voiture (admin uniquement)
router.post(
  '/',
  [
    roleMiddleware(['admin']),
    body('brand').notEmpty().withMessage('La marque est requise'),
    body('model').notEmpty().withMessage('Le modèle est requis'),
    body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Année invalide'),
    body('color').notEmpty().withMessage('La couleur est requise'),
    body('licensePlate').notEmpty().withMessage('La plaque d\'immatriculation est requise'),
    body('mileage').isInt({ min: 0 }).withMessage('Kilométrage invalide'),
    body('dailyPrice').isFloat({ min: 0 }).withMessage('Prix journalier invalide'),
    body('depositAmount').isFloat({ min: 0 }).withMessage('Montant de caution invalide'),
    body('includedKm').isInt({ min: 0 }).withMessage('Kilomètres inclus invalides'),
    body('extraKmPrice').isFloat({ min: 0 }).withMessage('Prix du kilomètre supplémentaire invalide'),
    body('seats').isInt({ min: 1 }).withMessage('Nombre de places invalide'),
    body('transmission').notEmpty().withMessage('Type de transmission requis'),
    body('fuelType').notEmpty().withMessage('Type de carburant requis'),
    validateRequest
  ],
  carController.createCar
);

// Mettre à jour une voiture (admin et manager)
router.put(
  '/:id',
  [
    roleMiddleware(['admin', 'manager']),
    param('id').isInt().withMessage('ID de voiture invalide'),
    validateRequest
  ],
  carController.updateCar
);

// Supprimer une voiture (admin uniquement)
router.delete(
  '/:id',
  [
    roleMiddleware(['admin']),
    param('id').isInt().withMessage('ID de voiture invalide'),
    validateRequest
  ],
  carController.deleteCar
);

// Gérer les disponibilités d'une voiture
router.post(
  '/:id/availability',
  [
    roleMiddleware(['admin', 'manager']),
    param('id').isInt().withMessage('ID de voiture invalide'),
    body('startDate').isISO8601().withMessage('Date de début invalide'),
    body('endDate').isISO8601().withMessage('Date de fin invalide'),
    body('reason').notEmpty().withMessage('Raison requise'),
    validateRequest
  ],
  carController.addCarAvailability
);

// Supprimer une disponibilité
router.delete(
  '/:carId/availability/:availabilityId',
  [
    roleMiddleware(['admin', 'manager']),
    param('carId').isInt().withMessage('ID de voiture invalide'),
    param('availabilityId').isInt().withMessage('ID de disponibilité invalide'),
    validateRequest
  ],
  carController.removeCarAvailability
);

module.exports = router;
