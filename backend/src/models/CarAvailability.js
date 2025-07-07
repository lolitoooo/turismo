module.exports = (sequelize, DataTypes) => {
  const CarAvailability = sequelize.define('CarAvailability', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    carId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'car_id'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_date'
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'end_date'
    },
    reason: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at'
    }
  }, {
    tableName: 'car_availabilities',
    timestamps: true
  });

  CarAvailability.associate = (models) => {
    CarAvailability.belongsTo(models.Car, {
      foreignKey: 'carId',
      as: 'car'
    });
  };

  return CarAvailability;
};
