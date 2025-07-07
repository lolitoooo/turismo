const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const routes = require('./routes');
const { errorHandler } = require('./middlewares/error.middleware');
const logger = require('./utils/logger');
const { sequelize } = require('./models');
const { initializeData } = require('./config/seeders');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
}

app.use('/api', routes);

app.use((req, res, next) => {
  res.status(404).json({
    message: 'Route non trouvée',
    path: req.path
  });
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await sequelize.sync({ force: process.env.NODE_ENV === 'development' && process.env.DB_RESET === 'true' });
    logger.info('Base de données synchronisée');
    await initializeData();
    logger.info('Données initiales chargées');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`Serveur démarré sur le port ${PORT} en mode ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

module.exports = { app, startServer };
