const { Category } = require('../models');
const { Op } = require('sequelize');

// Obtenir toutes les catégories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération des catégories' });
  }
};

// Obtenir une catégorie par ID
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);
    
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    
    return res.status(200).json(category);
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération de la catégorie' });
  }
};

// Créer une nouvelle catégorie
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Vérifier si la catégorie existe déjà
    const existingCategory = await Category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({ message: 'Une catégorie avec ce nom existe déjà' });
    }
    
    const newCategory = await Category.create({ name });
    return res.status(201).json(newCategory);
  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la création de la catégorie' });
  }
};

// Mettre à jour une catégorie
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    
    // Vérifier si le nouveau nom existe déjà pour une autre catégorie
    if (name) {
      const existingCategory = await Category.findOne({ 
        where: { name, id: { [Op.ne]: id } } 
      });
      
      if (existingCategory) {
        return res.status(400).json({ message: 'Une catégorie avec ce nom existe déjà' });
      }
    }
    
    await category.update({ name });
    return res.status(200).json(category);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de la catégorie' });
  }
};

// Supprimer une catégorie
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }
    
    await category.destroy();
    return res.status(200).json({ message: 'Catégorie supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la suppression de la catégorie' });
  }
};
