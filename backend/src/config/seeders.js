const { Role, ReservationStatus } = require('../models');
const logger = require('../utils/logger');

/**
 * Fonction pour initialiser les données de base nécessaires au fonctionnement de l'application
 */
const initializeData = async () => {
  try {
    // Création des rôles s'ils n'existent pas
    const roles = [
      { name: 'admin', description: 'Administrateur avec tous les droits' },
      { name: 'manager', description: 'Gestionnaire avec droits limités' },
      { name: 'customer', description: 'Client standard' }
    ];

    for (const role of roles) {
      const [roleRecord, created] = await Role.findOrCreate({
        where: { name: role.name },
        defaults: role
      });

      if (created) {
        logger.info(`Rôle créé: ${role.name}`);
      }
    }

    // Création des statuts de réservation s'ils n'existent pas
    const statuses = [
      { name: 'pending', description: 'Réservation en attente de confirmation' },
      { name: 'confirmed', description: 'Réservation confirmée' },
      { name: 'cancelled', description: 'Réservation annulée' },
      { name: 'in_progress', description: 'Location en cours' },
      { name: 'completed', description: 'Location terminée' },
      { name: 'refunded', description: 'Réservation remboursée' }
    ];

    for (const status of statuses) {
      const [statusRecord, created] = await ReservationStatus.findOrCreate({
        where: { name: status.name },
        defaults: status
      });

      if (created) {
        logger.info(`Statut de réservation créé: ${status.name}`);
      }
    }

    logger.info('Initialisation des données terminée avec succès');
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation des données:', error);
    throw error;
  }
};

module.exports = { initializeData };
