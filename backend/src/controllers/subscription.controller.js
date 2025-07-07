const { SubscriptionType } = require('../models');
const { Op } = require('sequelize');

// Obtenir tous les types d'abonnements
exports.getAllSubscriptionTypes = async (req, res) => {
  try {
    const subscriptionTypes = await SubscriptionType.findAll();
    return res.status(200).json(subscriptionTypes);
  } catch (error) {
    console.error('Erreur lors de la récupération des types d\'abonnement:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération des types d\'abonnement' });
  }
};

// Obtenir un type d'abonnement par ID
exports.getSubscriptionTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    const subscriptionType = await SubscriptionType.findByPk(id);
    
    if (!subscriptionType) {
      return res.status(404).json({ message: 'Type d\'abonnement non trouvé' });
    }
    
    return res.status(200).json(subscriptionType);
  } catch (error) {
    console.error('Erreur lors de la récupération du type d\'abonnement:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la récupération du type d\'abonnement' });
  }
};

// Créer un nouveau type d'abonnement
exports.createSubscriptionType = async (req, res) => {
  try {
    const { name, price, durationDays } = req.body;
    
    // Vérifier si le type d'abonnement existe déjà
    const existingType = await SubscriptionType.findOne({ where: { name } });
    if (existingType) {
      return res.status(400).json({ message: 'Un type d\'abonnement avec ce nom existe déjà' });
    }
    
    const newSubscriptionType = await SubscriptionType.create({ 
      name, 
      price, 
      durationDays 
    });
    
    return res.status(201).json(newSubscriptionType);
  } catch (error) {
    console.error('Erreur lors de la création du type d\'abonnement:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la création du type d\'abonnement' });
  }
};

// Mettre à jour un type d'abonnement
exports.updateSubscriptionType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, durationDays } = req.body;
    
    const subscriptionType = await SubscriptionType.findByPk(id);
    if (!subscriptionType) {
      return res.status(404).json({ message: 'Type d\'abonnement non trouvé' });
    }
    
    // Vérifier si le nouveau nom existe déjà pour un autre type d'abonnement
    if (name) {
      const existingType = await SubscriptionType.findOne({ 
        where: { name, id: { [Op.ne]: id } } 
      });
      
      if (existingType) {
        return res.status(400).json({ message: 'Un type d\'abonnement avec ce nom existe déjà' });
      }
    }
    
    // Mettre à jour les champs fournis
    const updateData = {};
    if (name) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (durationDays !== undefined) updateData.durationDays = durationDays;
    
    await subscriptionType.update(updateData);
    return res.status(200).json(subscriptionType);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du type d\'abonnement:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du type d\'abonnement' });
  }
};

// Supprimer un type d'abonnement
exports.deleteSubscriptionType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const subscriptionType = await SubscriptionType.findByPk(id);
    if (!subscriptionType) {
      return res.status(404).json({ message: 'Type d\'abonnement non trouvé' });
    }
    
    await subscriptionType.destroy();
    return res.status(200).json({ message: 'Type d\'abonnement supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du type d\'abonnement:', error);
    return res.status(500).json({ message: 'Erreur serveur lors de la suppression du type d\'abonnement' });
  }
};
