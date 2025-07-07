require('dotenv').config();
const { startServer } = require('./app');
const logger = require('./utils/logger');

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  logger.error('Erreur non capturée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesse rejetée non gérée:', reason);
  process.exit(1);
});

// Démarrage du serveur
startServer();
