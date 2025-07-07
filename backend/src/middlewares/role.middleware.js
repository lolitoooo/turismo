const logger = require('../utils/logger');

/**
 * Middleware de vérification des rôles
 * Vérifie si l'utilisateur a les rôles requis pour accéder à une ressource
 * @param {string[]} roles - Liste des rôles autorisés
 */
const checkRole = (roles) => {
  return (req, res, next) => {
    try {
      // Vérification si l'utilisateur existe dans la requête (middleware auth)
      if (!req.user) {
        return res.status(401).json({ message: 'Utilisateur non authentifié' });
      }

      // Vérification si l'utilisateur a un rôle
      if (!req.user.role) {
        return res.status(403).json({ message: 'Accès refusé. Rôle utilisateur non défini.' });
      }

      // Vérification si le rôle de l'utilisateur est dans la liste des rôles autorisés
      if (!roles.includes(req.user.role.name)) {
        return res.status(403).json({ 
          message: 'Accès refusé. Vous n\'avez pas les permissions nécessaires.' 
        });
      }

      // L'utilisateur a le rôle requis, on continue
      next();
    } catch (error) {
      logger.error('Erreur lors de la vérification des rôles:', error);
      return res.status(500).json({ message: 'Erreur lors de la vérification des permissions.' });
    }
  };
};

module.exports = {
  checkRole
};
