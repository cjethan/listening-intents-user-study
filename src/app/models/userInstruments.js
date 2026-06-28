import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../utils/database';

class UserInstrument extends Model {}

UserInstrument.init({
  user_id: {
    type: DataTypes.STRING,
    references: {
      model: 'user_results',
      key: 'user_id',
    },
    allowNull: false,
    primaryKey: true,
  },
  instrument_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'instruments',
      key: 'id',
    },
    allowNull: false,
    primaryKey: true,
  }
}, {
  sequelize,
  modelName: 'UserInstrument',
  tableName: 'user_instruments',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'instrument_id'],
    },
  ],
  timestamps: false,
});

export default UserInstrument;
