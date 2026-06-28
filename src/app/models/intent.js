import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../utils/database';
import UserResult from './results';

class Intent extends Model {}

Intent.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'user_results', // Reference the user_results table
      key: 'user_id',
    },
    onDelete: 'CASCADE',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  how_often: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  how_imp: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Intent',
  tableName: 'intents',
  timestamps: false,
});

Intent.belongsTo(UserResult, { foreignKey: 'user_id', onDelete: 'CASCADE' });

export default Intent;
