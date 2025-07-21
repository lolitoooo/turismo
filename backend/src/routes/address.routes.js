const express = require('express');
const { query } = require('express-validator');
const addressService = require('../services/address.service');
const { authenticateJWT } = require('../middlewares/auth');
const validateRequest = require('../middlewares/validateRequest');

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authenticateJWT);

/**
 * @route GET /api/address/search
 * @desc Recherche d'adresses avec autocomplétion
 * @access Private
 */
router.get('/search', [
  query('q').isString().notEmpty().withMessage('Le terme de recherche est requis'),
  validateRequest
], async (req, res) => {
  try {
    const { q } = req.query;
    const addresses = await addressService.searchAddresses(q);
    
    res.status(200).json({
      success: true,
      addresses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la recherche d\'adresses',
      error: error.message
    });
  }
});

/**
 * @route GET /api/address/reverse
 * @desc Récupération d'une adresse à partir de coordonnées
 * @access Private
 */
router.get('/reverse', [
  query('lon').isFloat().withMessage('La longitude doit être un nombre'),
  query('lat').isFloat().withMessage('La latitude doit être un nombre'),
  validateRequest
], async (req, res) => {
  try {
    const { lon, lat } = req.query;
    const address = await addressService.getAddressFromCoordinates(lon, lat);
    
    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Aucune adresse trouvée pour ces coordonnées'
      });
    }
    
    res.status(200).json({
      success: true,
      address
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'adresse',
      error: error.message
    });
  }
});

module.exports = router;
