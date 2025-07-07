module.exports = (sequelize, DataTypes) => {
  const ReservationStatus = sequelize.define('ReservationStatus', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
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
    tableName: 'reservation_statuses',
    timestamps: true
  });

  ReservationStatus.associate = (models) => {
    ReservationStatus.hasMany(models.Reservation, {
      foreignKey: 'statusId',
      as: 'reservations'
    });
  };

  return ReservationStatus;
};
