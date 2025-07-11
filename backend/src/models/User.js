const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'last_name'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'postal_code'
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    profileImage: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'profile_image'
    },
    driverLicenseNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'driver_license_number'
    },
    driverLicenseVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'driver_license_verified'
    },
    roleId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'role_id'
    },
    subscriptionTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'subscription_type_id'
    },
    subscriptionStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'subscription_start_date'
    },
    subscriptionEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'subscription_end_date'
    },
    resetPasswordToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'reset_password_token'
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'reset_password_expires'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
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
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  User.prototype.validPassword = async function(password) {
    // Pour le débogage, affichons le mot de passe fourni et le mot de passe haché stocké
    console.log('Tentative de validation du mot de passe pour:', this.email);
    console.log('Mot de passe fourni (longueur):', password.length);
    console.log('Hachage stocké (début):', this.password.substring(0, 10) + '...');
    
    try {
      // Essayer de valider avec bcryptjs
      const isValid = await bcrypt.compare(password, this.password);
      console.log('Résultat de la validation:', isValid);
      return isValid;
    } catch (error) {
      console.error('Erreur lors de la validation du mot de passe:', error);
      // En cas d'erreur, retourner false pour indiquer que la validation a échoué
      return false;
    }
  };

  User.associate = (models) => {
    User.belongsTo(models.Role, {
      foreignKey: 'roleId',
      as: 'role'
    });
    User.belongsTo(models.SubscriptionType, {
      foreignKey: 'subscriptionTypeId',
      as: 'subscriptionType'
    });
    User.hasMany(models.Reservation, {
      foreignKey: 'userId',
      as: 'reservations'
    });
    User.hasMany(models.Review, {
      foreignKey: 'userId',
      as: 'reviews'
    });
  };

  return User;
};
