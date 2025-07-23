module.exports = (sequelize, DataTypes) => {
  const Reservation = sequelize.define('Reservation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id'
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
    pickupLocation: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'pickup_location'
    },
    returnLocation: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'return_location'
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'confirmed'
    },
    specialRequests: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'special_requests'
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
    tableName: 'reservations',
    timestamps: true
  });

  Reservation.associate = (models) => {
    Reservation.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Reservation.belongsTo(models.Car, {
      foreignKey: 'carId',
      as: 'car'
    });
    Reservation.belongsTo(models.ReservationStatus, {
      foreignKey: 'statusId',
      as: 'reservationStatus'
    });
    Reservation.hasMany(models.Payment, {
      foreignKey: 'reservationId',
      as: 'payments'
    });
    Reservation.hasOne(models.Review, {
      foreignKey: 'reservationId',
      as: 'review'
    });
  };

  return Reservation;
};
