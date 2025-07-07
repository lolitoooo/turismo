const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

// Route d'inscription
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('firstName').notEmpty().withMessage('Le prénom est requis'),
    body('lastName').notEmpty().withMessage('Le nom est requis'),
    validateRequest
  ],
  authController.register
);

// Route de connexion
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Le mot de passe est requis'),
    validateRequest
  ],
  authController.login
);

// Route de demande de réinitialisation de mot de passe
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Email invalide'),
    validateRequest
  ],
  authController.forgotPassword
);

// Route de réinitialisation de mot de passe
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Le token est requis'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    validateRequest
  ],
  authController.resetPassword
);

// Route de vérification du token
router.get('/verify-token', authController.verifyToken);

module.exports = router;
