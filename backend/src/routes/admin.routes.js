const express = require('express');
const userController = require('../controllers/user.controller');
const adminController = require('../controllers/admin.controller');
const subscriptionController = require('../controllers/subscription.controller');
const carController = require('../controllers/car.controller');
const { authenticateJWT } = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');
const { query, body, param } = require('express-validator');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

// Middleware d'authentification et vérification du rôle admin pour toutes les routes
router.use(authenticateJWT);
router.use(roleMiddleware(['admin']));

// Routes pour la gestion des utilisateurs (admin uniquement)
// GET - Récupérer tous les utilisateurs avec pagination
router.get(
  '/users',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('La page doit être un entier positif'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('La limite doit être entre 1 et 100'),
    validateRequest
  ],
  userController.getAllUsers
);

// GET - Récupérer un utilisateur par ID
router.get(
  '/users/:id',
  [
    param('id').isInt().withMessage('ID utilisateur invalide'),
    validateRequest
  ],
  userController.getUserById
);

// POST - Créer un nouvel utilisateur
router.post(
  '/users',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('firstName').notEmpty().withMessage('Le prénom est requis'),
    body('lastName').notEmpty().withMessage('Le nom est requis'),
    body('role').optional().isString().withMessage('Le rôle doit être une chaîne de caractères'),
    body('isActive').optional().isBoolean().withMessage('Le statut doit être un booléen'),
    validateRequest
  ],
  userController.createUser
);

// PUT - Mettre à jour un utilisateur
router.put(
  '/users/:id',
  [
    param('id').isInt().withMessage('ID utilisateur invalide'),
    body('email').optional().isEmail().withMessage('Email invalide'),
    body('firstName').optional().notEmpty().withMessage('Le prénom ne peut pas être vide'),
    body('lastName').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
    body('role').optional().isString().withMessage('Le rôle doit être une chaîne de caractères'),
    body('isActive').optional().isBoolean().withMessage('Le statut doit être un booléen'),
    validateRequest
  ],
  userController.updateUser
);

// DELETE - Supprimer un utilisateur
router.delete(
  '/users/:id',
  [
    param('id').isInt().withMessage('ID utilisateur invalide'),
    validateRequest
  ],
  userController.deleteUser
);

// GET - Récupérer les statistiques du dashboard admin
router.get('/stats', adminController.getDashboardStats);

// GET - Récupérer l'activité récente
router.get('/activity', adminController.getRecentActivity);

// Routes pour la gestion des types d'abonnements
// GET - Récupérer tous les types d'abonnements
router.get('/subscriptions', subscriptionController.getAllSubscriptionTypes);

// GET - Récupérer un type d'abonnement par ID
router.get('/subscriptions/:id', [
  param('id').isInt().withMessage('ID de type d\'abonnement invalide'),
  validateRequest
], subscriptionController.getSubscriptionTypeById);

// POST - Créer un nouveau type d'abonnement
router.post('/subscriptions', [
  body('name').notEmpty().withMessage('Le nom est requis'),
  body('price').isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
  body('level').optional().isInt({ min: 1, max: 6 }).withMessage('Le niveau doit être entre 1 et 6'),
  body('description').optional(),
  body('features').optional(),
  validateRequest
], subscriptionController.createSubscriptionType);

// PUT - Mettre à jour un type d'abonnement
router.put('/subscriptions/:id', [
  param('id').isInt().withMessage('ID de type d\'abonnement invalide'),
  body('name').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
  body('level').optional().isInt({ min: 1, max: 6 }).withMessage('Le niveau doit être entre 1 et 6'),
  validateRequest
], subscriptionController.updateSubscriptionType);

// DELETE - Supprimer un type d'abonnement
router.delete('/subscriptions/:id', [
  param('id').isInt().withMessage('ID de type d\'abonnement invalide'),
  validateRequest
], subscriptionController.deleteSubscriptionType);

// Routes pour la gestion des abonnements utilisateurs
// GET - Récupérer tous les abonnements utilisateurs
router.get('/user-subscriptions', [
  query('page').optional().isInt({ min: 1 }).withMessage('La page doit être un entier positif'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('La limite doit être entre 1 et 100'),
  validateRequest
], subscriptionController.getUserSubscriptions);

// GET - Récupérer un abonnement utilisateur par ID
router.get('/user-subscriptions/:id', [
  param('id').isInt().withMessage('ID d\'abonnement invalide'),
  validateRequest
], subscriptionController.getUserSubscriptionById);

// POST - Créer un nouvel abonnement utilisateur
router.post('/user-subscriptions', [
  body('userId').isInt().withMessage('ID utilisateur invalide'),
  body('subscriptionTypeId').isInt().withMessage('ID de type d\'abonnement invalide'),
  body('startDate').optional().isISO8601().withMessage('Date de début invalide'),
  body('expiryDate').isISO8601().withMessage('Date d\'expiration invalide'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
  validateRequest
], subscriptionController.createUserSubscription);

// PUT - Mettre à jour un abonnement utilisateur
router.put('/user-subscriptions/:id', [
  param('id').isInt().withMessage('ID d\'abonnement invalide'),
  body('subscriptionTypeId').optional().isInt().withMessage('ID de type d\'abonnement invalide'),
  body('startDate').optional().isISO8601().withMessage('Date de début invalide'),
  body('expiryDate').optional().isISO8601().withMessage('Date d\'expiration invalide'),
  body('status').optional().isIn(['active', 'expired', 'cancelled', 'pending']).withMessage('Statut invalide'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Le prix doit être un nombre positif'),
  validateRequest
], subscriptionController.updateUserSubscription);

// DELETE - Annuler un abonnement utilisateur
router.delete('/user-subscriptions/:id', [
  param('id').isInt().withMessage('ID d\'abonnement invalide'),
  validateRequest
], subscriptionController.cancelUserSubscription);

// Routes pour la gestion des véhicules
// GET - Récupérer tous les véhicules
router.get('/cars', carController.getAllCars);

// GET - Récupérer un véhicule par ID
router.get('/cars/:id', [
  param('id').isInt().withMessage('ID de véhicule invalide'),
  validateRequest
], carController.getCarById);

// POST - Créer un nouveau véhicule
router.post('/cars', [
  body('brand').notEmpty().withMessage('La marque est requise'),
  body('model').notEmpty().withMessage('Le modèle est requis'),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Année invalide'),
  body('categoryId').isInt().withMessage('ID de catégorie invalide'),
  validateRequest
], carController.createCar);

// PUT - Mettre à jour un véhicule
router.put('/cars/:id', [
  param('id').isInt().withMessage('ID de véhicule invalide'),
  body('brand').optional().notEmpty().withMessage('La marque ne peut pas être vide'),
  body('model').optional().notEmpty().withMessage('Le modèle ne peut pas être vide'),
  validateRequest
], carController.updateCar);

// DELETE - Supprimer un véhicule
router.delete('/cars/:id', [
  param('id').isInt().withMessage('ID de véhicule invalide'),
  validateRequest
], carController.deleteCar);

module.exports = router;
