module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define('Subscription', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    subscriptionTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'subscription_type_id',
      references: {
        model: 'subscription_types',
        key: 'id'
      }
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'start_date',
      defaultValue: DataTypes.NOW
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'expiry_date'
    },
    status: {
      type: DataTypes.ENUM('active', 'expired', 'cancelled'),
      allowNull: false,
      defaultValue: 'active'
    },
    autoRenew: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'auto_renew'
    },
    paymentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'payment_id',
      references: {
        model: 'payments',
        key: 'id'
      }
    }
  }, {
    tableName: 'subscriptions',
    timestamps: true,
    underscored: true
  });

  Subscription.associate = (models) => {
    // Relation avec l'utilisateur
    Subscription.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // Relation avec le type d'abonnement
    Subscription.belongsTo(models.SubscriptionType, {
      foreignKey: 'subscriptionTypeId',
      as: 'subscriptionType'
    });

    // Relation avec les paiements
    Subscription.belongsTo(models.Payment, {
      foreignKey: 'paymentId',
      as: 'payment'
    });
    
    Subscription.hasMany(models.Payment, {
      foreignKey: 'subscriptionId',
      as: 'payments'
    });
  };

  return Subscription;
};
