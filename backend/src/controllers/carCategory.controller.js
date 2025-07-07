const { CarCategory, Car } = require('../models');
const logger = require('../utils/logger');

/**
 * Contrôleur pour la gestion des catégories de voitures
 */
const carCategoryController = {
  /**
   * Récupération de toutes les catégories
   */
  getAllCategories: async (req, res, next) => {
    try {
      const categories = await CarCategory.findAll();

      res.status(200).json({
        message: 'Liste des catégories récupérée avec succès',
        categories
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Récupération d'une catégorie par son ID
   */
  getCategoryById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const category = await CarCategory.findByPk(id, {
        include: [{ model: Car, as: 'cars' }]
      });

      if (!category) {
        return res.status(404).json({ message: 'Catégorie non trouvée' });
      }

      res.status(200).json({
        message: 'Catégorie récupérée avec succès',
        category
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Création d'une nouvelle catégorie
   */
  createCategory: async (req, res, next) => {
    try {
      const { name, description, icon } = req.body;

      // Vérification si le nom existe déjà
      const existingCategory = await CarCategory.findOne({ where: { name } });
      if (existingCategory) {
        return res.status(400).json({ message: 'Une catégorie avec ce nom existe déjà' });
      }

      // Création de la catégorie
      const category = await CarCategory.create({
        name,
        description,
        icon
      });

      res.status(201).json({
        message: 'Catégorie créée avec succès',
        category
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mise à jour d'une catégorie
   */
  updateCategory: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, description, icon } = req.body;

      // Récupération de la catégorie
      const category = await CarCategory.findByPk(id);
      if (!category) {
        return res.status(404).json({ message: 'Catégorie non trouvée' });
      }

      // Vérification si le nom existe déjà (si changement de nom)
      if (name && name !== category.name) {
        const existingCategory = await CarCategory.findOne({ where: { name } });
        if (existingCategory) {
          return res.status(400).json({ message: 'Une catégorie avec ce nom existe déjà' });
        }
      }

      // Mise à jour de la catégorie
      await category.update({
        name: name || category.name,
        description: description || category.description,
        icon: icon || category.icon
      });

      res.status(200).json({
        message: 'Catégorie mise à jour avec succès',
        category
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Suppression d'une catégorie
   */
  deleteCategory: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Récupération de la catégorie
      const category = await CarCategory.findByPk(id, {
        include: [{ model: Car, as: 'cars' }]
      });

      if (!category) {
        return res.status(404).json({ message: 'Catégorie non trouvée' });
      }

      // Vérification si des voitures sont associées à cette catégorie
      if (category.cars && category.cars.length > 0) {
        return res.status(400).json({ 
          message: 'Impossible de supprimer cette catégorie car des voitures y sont associées',
          carsCount: category.cars.length
        });
      }

      // Suppression de la catégorie
      await category.destroy();

      res.status(200).json({
        message: 'Catégorie supprimée avec succès'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = carCategoryController;
