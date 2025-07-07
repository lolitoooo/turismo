const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Service pour la vérification des permis de conduire
 * Utilise une API tierce fictive pour la démonstration
 */
const driverLicenseService = {
  /**
   * Vérifie la validité d'un permis de conduire
   * @param {string} licenseNumber - Numéro du permis de conduire
   * @returns {Promise<Object>} - Résultat de la vérification
   */
  verifyLicense: async (licenseNumber) => {
    try {
      // En environnement de production, on utiliserait une API réelle
      if (process.env.NODE_ENV === 'production' && process.env.DRIVER_LICENSE_API_KEY) {
        const response = await axios.post(
          'https://api.driverlicense-verification.example/verify',
          { licenseNumber },
          {
            headers: {
              'Authorization': `Bearer ${process.env.DRIVER_LICENSE_API_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        return {
          isValid: response.data.valid,
          details: response.data
        };
      } 
      
      // En développement, on simule une vérification
      logger.info(`Simulation de vérification du permis: ${licenseNumber}`);
      
      // Pour la démonstration, on considère valides les permis qui commencent par "V"
      const isValid = licenseNumber.startsWith('V');
      
      return {
        isValid,
        details: {
          licenseNumber,
          verificationDate: new Date().toISOString(),
          status: isValid ? 'valid' : 'invalid',
          message: isValid 
            ? 'Permis de conduire valide' 
            : 'Permis de conduire invalide ou expiré'
        }
      };
    } catch (error) {
      logger.error(`Erreur lors de la vérification du permis ${licenseNumber}:`, error);
      
      // En cas d'erreur, on renvoie un résultat négatif
      return {
        isValid: false,
        details: {
          licenseNumber,
          verificationDate: new Date().toISOString(),
          status: 'error',
          message: 'Erreur lors de la vérification du permis'
        }
      };
    }
  }
};

module.exports = driverLicenseService;
