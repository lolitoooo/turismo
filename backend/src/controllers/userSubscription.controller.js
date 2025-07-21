const { User, SubscriptionType } = require('../models');
const logger = require('../utils/logger');

/**
 * Contrôleur pour la gestion des abonnements utilisateur
 */
const userSubscriptionController = {
  /**
   * Souscription d'un utilisateur à un abonnement
   */
  subscribeUser: async (req, res, next) => {
    try {
      const { userId, subscriptionId } = req.body;
      
      // Vérification de sécurité : l'utilisateur authentifié doit être celui pour lequel on souscrit
      // ou un administrateur
      if (req.user.id !== parseInt(userId) && req.user.role?.name !== 'admin') {
        logger.warn(`Tentative d'accès non autorisé: l'utilisateur ${req.user.id} essaie de souscrire pour l'utilisateur ${userId}`);
        return res.status(403).json({ 
          success: false,
          message: 'Vous n\'êtes pas autorisé à souscrire un abonnement pour cet utilisateur' 
        });
      }
      
      // Vérification de l'existence de l'utilisateur
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      
      // Vérification de l'existence du type d'abonnement
      const subscriptionType = await SubscriptionType.findByPk(subscriptionId);
      if (!subscriptionType) {
        return res.status(404).json({ message: 'Type d\'abonnement non trouvé' });
      }
      
      // Calcul des dates de début et de fin d'abonnement
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + subscriptionType.durationDays || 30);
      
      // Mise à jour de l'abonnement de l'utilisateur
      await user.update({
        subscriptionTypeId: subscriptionId,
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate
      });
      
      // Récupération des données utilisateur mises à jour
      const updatedUser = await User.findByPk(userId, {
        include: [{
          model: SubscriptionType,
          as: 'subscriptionType'
        }]
      });
      
      res.status(200).json({
        success: true,
        message: 'Abonnement souscrit avec succès',
        subscription: {
          id: subscriptionId,
          name: subscriptionType.name,
          startDate: startDate,
          expiryDate: endDate
        },
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          subscription: {
            id: subscriptionId,
            name: subscriptionType.name,
            startDate: startDate,
            expiryDate: endDate
          }
        }
      });
    } catch (error) {
      logger.error('Erreur lors de la souscription à l\'abonnement:', error);
      next(error);
    }
  },
  
  /**
   * Récupération de l'abonnement d'un utilisateur
   */
  getUserSubscription: async (req, res, next) => {
    try {
      const { userId } = req.params;
      
      const user = await User.findByPk(userId, {
        include: [{
          model: SubscriptionType,
          as: 'subscriptionType'
        }]
      });
      
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      
      if (!user.subscriptionTypeId || !user.subscriptionType) {
        return res.status(404).json({ message: 'Aucun abonnement actif pour cet utilisateur' });
      }
      
      res.status(200).json({
        success: true,
        subscription: {
          id: user.subscriptionTypeId,
          name: user.subscriptionType.name,
          price: user.subscriptionType.price,
          daysPerMonth: user.subscriptionType.daysPerMonth,
          vehicleAccess: user.subscriptionType.vehicleAccess,
          startDate: user.subscriptionStartDate,
          expiryDate: user.subscriptionEndDate
        }
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération de l\'abonnement utilisateur:', error);
      next(error);
    }
  },
  
  /**
   * Annulation de l'abonnement d'un utilisateur
   */
  cancelUserSubscription: async (req, res, next) => {
    try {
      const { userId } = req.params;
      
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      
      if (!user.subscriptionTypeId) {
        return res.status(400).json({ message: 'Cet utilisateur n\'a pas d\'abonnement actif' });
      }
      
      // Annulation de l'abonnement
      await user.update({
        subscriptionTypeId: null,
        subscriptionStartDate: null,
        subscriptionEndDate: null
      });
      
      res.status(200).json({
        success: true,
        message: 'Abonnement annulé avec succès'
      });
    } catch (error) {
      logger.error('Erreur lors de l\'annulation de l\'abonnement:', error);
      next(error);
    }
  }
};

module.exports = userSubscriptionController;
