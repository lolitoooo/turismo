const { validationResult } = require('express-validator');

/**
 * Middleware de validation des requêtes
 * Utilise express-validator pour vérifier les données entrantes
 */
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Erreur de validation des données',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg
      }))
    });
  }
  
  next();
};
