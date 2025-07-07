const logger = require('../utils/logger');

/**
 * Middleware de gestion des erreurs
 * Capture toutes les erreurs non gérées et renvoie une réponse appropriée
 */
const errorHandler = (err, req, res, next) => {
  // Journalisation de l'erreur
  logger.error(`Erreur: ${err.message}`, { 
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
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
    return res.status(401).json({
      message: 'Token invalide'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expiré'
    });
  }

  // Gestion des erreurs personnalisées avec code HTTP
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      message: err.message
    });
  }

  // Erreur par défaut
  res.status(500).json({
    message: 'Une erreur est survenue sur le serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

/**
 * Middleware pour capturer les routes non trouvées
 */
const notFoundHandler = (req, res) => {
  logger.warn(`Route non trouvée: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: 'Route non trouvée'
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
