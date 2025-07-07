const { SubscriptionType, User } = require('../models');
const logger = require('../utils/logger');

/**
 * Contrôleur pour la gestion des types d'abonnement
 */
const subscriptionTypeController = {
  /**
   * Récupération de tous les types d'abonnement
   */
  getAllSubscriptionTypes: async (req, res, next) => {
    try {
      const subscriptionTypes = await SubscriptionType.findAll();

      res.status(200).json({
        message: 'Liste des types d\'abonnement récupérée avec succès',
        subscriptionTypes
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Récupération d'un type d'abonnement par son ID
   */
  getSubscriptionTypeById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const subscriptionType = await SubscriptionType.findByPk(id);

      if (!subscriptionType) {
        return res.status(404).json({ message: 'Type d\'abonnement non trouvé' });
      }

      res.status(200).json({
        message: 'Type d\'abonnement récupéré avec succès',
        subscriptionType
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Création d'un nouveau type d'abonnement
   */
  createSubscriptionType: async (req, res, next) => {
    try {
      const { name, description, price, durationDays, benefits } = req.body;

      // Vérification si le nom existe déjà
      const existingType = await SubscriptionType.findOne({ where: { name } });
      if (existingType) {
        return res.status(400).json({ message: 'Un type d\'abonnement avec ce nom existe déjà' });
      }

      // Création du type d'abonnement
      const subscriptionType = await SubscriptionType.create({
        name,
        description,
        price,
        durationDays,
        benefits: benefits || {}
      });

      res.status(201).json({
        message: 'Type d\'abonnement créé avec succès',
        subscriptionType
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mise à jour d'un type d'abonnement
   */
  updateSubscriptionType: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, description, price, durationDays, benefits } = req.body;

      // Récupération du type d'abonnement
      const subscriptionType = await SubscriptionType.findByPk(id);
      if (!subscriptionType) {
        return res.status(404).json({ message: 'Type d\'abonnement non trouvé' });
      }

      // Vérification si le nom existe déjà (si changement de nom)
      if (name && name !== subscriptionType.name) {
        const existingType = await SubscriptionType.findOne({ where: { name } });
        if (existingType) {
          return res.status(400).json({ message: 'Un type d\'abonnement avec ce nom existe déjà' });
        }
      }

      // Mise à jour du type d'abonnement
      await subscriptionType.update({
        name: name || subscriptionType.name,
        description: description || subscriptionType.description,
        price: price !== undefined ? price : subscriptionType.price,
        durationDays: durationDays !== undefined ? durationDays : subscriptionType.durationDays,
        benefits: benefits || subscriptionType.benefits
      });

      res.status(200).json({
        message: 'Type d\'abonnement mis à jour avec succès',
        subscriptionType
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Suppression d'un type d'abonnement
   */
  deleteSubscriptionType: async (req, res, next) => {
    try {
      const { id } = req.params;

      // Récupération du type d'abonnement
      const subscriptionType = await SubscriptionType.findByPk(id);
      if (!subscriptionType) {
        return res.status(404).json({ message: 'Type d\'abonnement non trouvé' });
      }

      // Vérification si des utilisateurs sont abonnés à ce type
      const subscribedUsers = await User.count({ where: { subscriptionTypeId: id } });
      if (subscribedUsers > 0) {
        return res.status(400).json({ 
          message: 'Impossible de supprimer ce type d\'abonnement car des utilisateurs y sont abonnés',
          subscribedUsersCount: subscribedUsers
        });
      }

      // Suppression du type d'abonnement
      await subscriptionType.destroy();

      res.status(200).json({
        message: 'Type d\'abonnement supprimé avec succès'
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = subscriptionTypeController;
