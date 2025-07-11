const { User, Subscription, Reservation, Car, Payment, Role, SubscriptionType, ReservationStatus } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const adminController = {
  /**
   * Récupérer les statistiques pour le dashboard admin
   */
  getDashboardStats: async (req, res, next) => {
    try {
      // Nombre total d'utilisateurs
      const userCount = await User.count();
      
      // Nombre d'abonnements actifs
      const activeSubscriptions = await Subscription.count({
        where: {
          expiryDate: {
            [Op.gt]: new Date() // Date d'expiration supérieure à la date actuelle
          }
        }
      });
      
      // Nombre total de réservations
      const reservationCount = await Reservation.count();
      
      // Revenus mensuels (somme des paiements du mois en cours)
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const monthlyPayments = await Payment.findAll({
        where: {
          createdAt: {
            [Op.between]: [firstDayOfMonth, lastDayOfMonth]
          },
          status: 'completed' // Uniquement les paiements complétés
        },
        attributes: ['amount']
      });
      
      const monthlyRevenue = monthlyPayments.reduce((total, payment) => total + payment.amount, 0);
      
      res.status(200).json({
        userCount,
        activeSubscriptions,
        reservationCount,
        monthlyRevenue
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des statistiques admin:', error);
      next(error);
    }
  },
  
  /**
   * Récupérer l'activité récente pour le dashboard admin
   */
  getRecentActivity: async (req, res, next) => {
    try {
      const limit = req.query.limit || 10; // Nombre d'activités à récupérer
      
      // Récupérer les utilisateurs récemment créés
      const recentUsers = await User.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        attributes: ['id', 'firstName', 'lastName', 'createdAt']
      });
      
      // Récupérer les abonnements récemment créés
      const recentSubscriptions = await Subscription.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName'] },
          { model: SubscriptionType, as: 'subscriptionType', attributes: ['name'] }
        ],
        attributes: ['id', 'createdAt', 'startDate', 'expiryDate']
      });
      
      // Récupérer les réservations récentes
      const recentReservations = await Reservation.findAll({
        order: [['createdAt', 'DESC']],
        limit: 5,
        include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName'] },
          { model: Car, as: 'car', attributes: ['brand', 'model'] },
          { model: ReservationStatus, as: 'status', attributes: ['name'] }
        ],
        attributes: ['id', 'createdAt', 'startDate', 'endDate', 'statusId']
      });
      
      // Combiner et formater les activités
      const activities = [
        ...recentUsers.map(user => ({
          id: `user-${user.id}`,
          type: 'user',
          message: `Nouvel utilisateur inscrit: ${user.firstName} ${user.lastName}`,
          timestamp: user.createdAt
        })),
        ...recentSubscriptions.map(sub => ({
          id: `subscription-${sub.id}`,
          type: 'subscription',
          message: `Nouvel abonnement ${sub.subscriptionType?.name || 'Standard'} pour ${sub.user?.firstName || 'Utilisateur'} ${sub.user?.lastName || ''}`,
          timestamp: sub.createdAt
        })),
        ...recentReservations.map(res => ({
          id: `reservation-${res.id}`,
          type: 'reservation',
          message: `Nouvelle réservation de ${res.car?.brand || 'Véhicule'} ${res.car?.model || ''} par ${res.user?.firstName || 'Utilisateur'} ${res.user?.lastName || ''} (${res.status?.name || 'En attente'})`,
          timestamp: res.createdAt
        }))
      ];
      
      // Trier par date décroissante et limiter le nombre
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit);
      
      res.status(200).json({
        activities: sortedActivities
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération de l\'activité récente:', error);
      next(error);
    }
  }
};

module.exports = adminController;
