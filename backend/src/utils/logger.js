const winston = require('winston');
const path = require('path');

// Configuration des formats
const formats = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Création du logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: formats,
  defaultMeta: { service: 'driveturismo-api' },
  transports: [
    // Écriture dans la console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(info => {
          const { timestamp, level, message, ...rest } = info;
          return `${timestamp} ${level}: ${message} ${
            Object.keys(rest).length ? JSON.stringify(rest, null, 2) : ''
          }`;
        })
      )
    })
  ]
});

// En production, on ajoute des logs dans des fichiers
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/error.log'), 
      level: 'error' 
    })
  );
  logger.add(
    new winston.transports.File({ 
      filename: path.join(__dirname, '../../logs/combined.log') 
    })
  );
}

module.exports = logger;
