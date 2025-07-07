const express = require('express');
const { body, param } = require('express-validator');
const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middlewares/auth');
const roleMiddleware = require('../middlewares/role');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

// Routes publiques
// Obtenir toutes les catégories
router.get('/', categoryController.getAllCategories);

// Obtenir une catégorie par ID
router.get(
  '/:id',
  [
    param('id').isInt().withMessage('ID de catégorie invalide'),
    validateRequest
  ],
  categoryController.getCategoryById
);

// Routes protégées
router.use(authMiddleware);

// Créer une nouvelle catégorie (admin uniquement)
router.post(
  '/',
  [
    roleMiddleware(['admin']),
    body('name').notEmpty().withMessage('Le nom est requis'),
    validateRequest
  ],
  categoryController.createCategory
);

// Mettre à jour une catégorie (admin uniquement)
router.put(
  '/:id',
  [
    roleMiddleware(['admin']),
    param('id').isInt().withMessage('ID de catégorie invalide'),
    body('name').optional().notEmpty().withMessage('Le nom ne peut pas être vide'),
    validateRequest
  ],
  categoryController.updateCategory
);

// Supprimer une catégorie (admin uniquement)
router.delete(
  '/:id',
  [
    roleMiddleware(['admin']),
    param('id').isInt().withMessage('ID de catégorie invalide'),
    validateRequest
  ],
  categoryController.deleteCategory
);

module.exports = router;
