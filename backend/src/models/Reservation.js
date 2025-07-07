module.exports = (sequelize, DataTypes) => {
  const Reservation = sequelize.define('Reservation', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'user_id'
    },
    carId: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
      allowNull: true,
      field: 'pickup_location'
    },
    returnLocation: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'return_location'
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'total_price'
    },
    depositPaid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'deposit_paid'
    },
    depositAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'deposit_amount'
    },
    depositPaymentId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'deposit_payment_id'
    },
    statusId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'status_id'
    },
    initialMileage: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'initial_mileage'
    },
    finalMileage: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'final_mileage'
    },
    extraKm: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'extra_km'
    },
    extraCharges: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'extra_charges'
    },
    notes: {
      type: DataTypes.TEXT,
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
      as: 'status'
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
