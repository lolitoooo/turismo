const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Middleware de validation des requêtes
 * Vérifie si la requête contient des erreurs de validation
 * et renvoie une réponse d'erreur si c'est le cas
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn(`Erreurs de validation: ${JSON.stringify(errors.array())}`);
    return res.status(400).json({
      message: 'Erreur de validation des données',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  validate
};
