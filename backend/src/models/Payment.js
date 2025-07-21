module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    reservationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'reservation_id'
    },
    subscriptionId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'subscription_id'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    paymentType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'payment_type'
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'payment_method'
    },
    transactionId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'transaction_id'
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'payment_date'
    },
    paymentDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'payment_details',
      comment: 'Informations complètes du paiement Stripe pour la facturation'
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
    tableName: 'payments',
    timestamps: true
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.Reservation, {
      foreignKey: 'reservationId',
      as: 'reservation'
    });
    
    Payment.belongsTo(models.Subscription, {
      foreignKey: 'subscriptionId',
      as: 'subscription'
    });
    
    Payment.hasMany(models.Subscription, {
      foreignKey: 'paymentId',
      as: 'subscriptions'
    });
  };

  return Payment;
};
