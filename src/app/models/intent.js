import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../utils/database'; // assuming your sequelize instance
import UserResult from './results'; // Import UserResult for association

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
    onDelete: 'CASCADE', // Ensure intents are deleted if the user is deleted
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
  timestamps: false, // Disable automatic timestamps
});

// Define association with UserResult
Intent.belongsTo(UserResult, { foreignKey: 'user_id', onDelete: 'CASCADE' });

export default Intent;
