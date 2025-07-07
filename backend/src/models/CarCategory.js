module.exports = (sequelize, DataTypes) => {
  const CarCategory = sequelize.define('CarCategory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
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
    tableName: 'car_categories',
    timestamps: true
  });

  CarCategory.associate = (models) => {
    CarCategory.hasMany(models.Car, {
      foreignKey: 'categoryId',
      as: 'cars'
    });
  };

  return CarCategory;
};
