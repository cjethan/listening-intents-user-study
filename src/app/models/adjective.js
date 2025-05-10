const { Model, DataTypes } = require('sequelize');
import { sequelize } from '../utils/database'; // assuming your sequelize instance

class Adjective extends Model {}

Adjective.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  word: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'Adjective',
  tableName: 'adjectives',
  timestamps: false,
});

export default Adjective;
