const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const logger = require('../utils/logger');

const db = {};
const sequelize = new Sequelize(
  process.env.DB_NAME || process.env.POSTGRES_DB || 'drive_turismo',
  process.env.DB_USER || process.env.POSTGRES_USER,
  process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD,
  {
    host: process.env.DB_HOST || process.env.POSTGRES_HOST || 'database',
    port: process.env.DB_PORT || process.env.POSTGRES_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true
    }
  }
);

fs.readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
