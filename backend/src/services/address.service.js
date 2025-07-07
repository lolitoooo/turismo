const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Service pour interagir avec l'API Adresse Data Gouv
 */
const addressService = {
  /**
   * Recherche d'adresses à partir d'un texte
   * @param {string} query - Texte de recherche
   * @returns {Promise<Array>} - Liste des adresses correspondantes
   */
  searchAddresses: async (query) => {
    try {
      if (!query || query.trim().length < 3) {
        return [];
      }

      const response = await axios.get(`https://api-adresse.data.gouv.fr/search/`, {
        params: {
          q: query,
          limit: 5
        }
      });

      if (response.data && response.data.features) {
        return response.data.features.map(feature => ({
          label: feature.properties.label,
          city: feature.properties.city,
          postcode: feature.properties.postcode,
          context: feature.properties.context,
          coordinates: feature.geometry.coordinates, // [longitude, latitude]
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0],
          score: feature.properties.score
        }));
      }

      return [];
    } catch (error) {
      logger.error('Erreur lors de la recherche d\'adresses:', error);
      return [];
    }
  },

  /**
   * Récupération des détails d'une adresse à partir de coordonnées
   * @param {number} longitude - Longitude
   * @param {number} latitude - Latitude
   * @returns {Promise<Object|null>} - Détails de l'adresse
   */
  getAddressFromCoordinates: async (longitude, latitude) => {
    try {
      const response = await axios.get(`https://api-adresse.data.gouv.fr/reverse/`, {
        params: {
          lon: longitude,
          lat: latitude
        }
      });

      if (response.data && response.data.features && response.data.features.length > 0) {
        const feature = response.data.features[0];
        return {
          label: feature.properties.label,
          city: feature.properties.city,
          postcode: feature.properties.postcode,
          context: feature.properties.context,
          coordinates: feature.geometry.coordinates,
          latitude: feature.geometry.coordinates[1],
          longitude: feature.geometry.coordinates[0]
        };
      }

      return null;
    } catch (error) {
      logger.error('Erreur lors de la récupération des détails d\'adresse:', error);
      return null;
    }
  }
};

module.exports = addressService;
