
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../utils/database'; 

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
