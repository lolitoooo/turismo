const logger = require('../utils/logger');

/**
 * Middleware de gestion globale des erreurs
 */
module.exports = (err, req, res, next) => {
  // Journalisation de l'erreur
  logger.error(`Erreur: ${err.message}`, { 
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // Gestion des erreurs Sequelize
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      message: 'Erreur de validation des données',
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  // Gestion des erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Token invalide' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expiré' });
  }

  // Erreur personnalisée avec code HTTP
  if (err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Erreur par défaut
  return res.status(500).json({ 
    message: 'Erreur serveur interne',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
