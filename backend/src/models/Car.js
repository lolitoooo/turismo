module.exports = (sequelize, DataTypes) => {
  const Car = sequelize.define('Car', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    color: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    licensePlate: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      field: 'license_plate'
    },
    mileage: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'category_id'
    },
    dailyPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'daily_price'
    },
    depositAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'deposit_amount'
    },
    includedKm: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'included_km'
    },
    extraKmPrice: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
      field: 'extra_km_price'
    },
    seats: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    transmission: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    fuelType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'fuel_type'
    },
    features: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    images: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    isAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_available'
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
    tableName: 'cars',
    timestamps: true
  });

  Car.associate = (models) => {
    Car.belongsTo(models.CarCategory, {
      foreignKey: 'categoryId',
      as: 'category'
    });
    Car.hasMany(models.CarAvailability, {
      foreignKey: 'carId',
      as: 'availabilities'
    });
    Car.hasMany(models.Reservation, {
      foreignKey: 'carId',
      as: 'reservations'
    });
    Car.hasMany(models.Review, {
      foreignKey: 'carId',
      as: 'reviews'
    });
  };

  return Car;
};
