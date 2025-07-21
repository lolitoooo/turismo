const express = require('express');
const { body, param } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authenticateJWT } = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticateJWT);

// Routes du profil utilisateur
router.get('/profile', userController.getProfile);
router.put('/profile', [
  body('firstName').optional().notEmpty().withMessage('Le prénom ne peut pas être vide'),
  body('lastName').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
  validateRequest
], userController.updateProfile);

// Obtenir tous les utilisateurs (admin uniquement)
router.get(
  '/',
  roleMiddleware(['admin', 'manager']),
  userController.getAllUsers
);

// Obtenir un utilisateur par ID
router.get(
  '/:id',
  [
    param('id').isInt().withMessage('ID utilisateur invalide'),
    validateRequest
  ],
  userController.getUserById
);

// Créer un nouvel utilisateur (admin uniquement)
router.post(
  '/',
  [
    roleMiddleware(['admin']),
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('firstName').notEmpty().withMessage('Le prénom est requis'),
    body('lastName').notEmpty().withMessage('Le nom est requis'),
    body('roleId').isInt().withMessage('ID de rôle invalide'),
    validateRequest
  ],
  userController.createUser
);

// Mettre à jour un utilisateur
router.put(
  '/:id',
  [
    param('id').isInt().withMessage('ID utilisateur invalide'),
    body('email').optional().isEmail().withMessage('Email invalide'),
    body('firstName').optional().notEmpty().withMessage('Le prénom ne peut pas être vide'),
    body('lastName').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
    validateRequest
  ],
  userController.updateUser
);

// Supprimer un utilisateur (admin uniquement)
router.delete(
  '/:id',
  [
    roleMiddleware(['admin']),
    param('id').isInt().withMessage('ID utilisateur invalide'),
    validateRequest
  ],
  userController.deleteUser
);

// Vérifier le permis de conduire d'un utilisateur
router.post(
  '/:id/verify-license',
  [
    param('id').isInt().withMessage('ID utilisateur invalide'),
    body('licenseNumber').notEmpty().withMessage('Numéro de permis requis'),
    validateRequest
  ],
  userController.verifyDriverLicense
);

// Gérer l'abonnement d'un utilisateur
router.post(
  '/:id/subscription',
  [
    param('id').isInt().withMessage('ID utilisateur invalide'),
    body('subscriptionTypeId').isInt().withMessage('ID de type d\'abonnement invalide'),
    validateRequest
  ],
  userController.manageSubscription
);

module.exports = router;
