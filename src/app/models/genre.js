const { Model, DataTypes } = require('sequelize');
import { sequelize } from '../utils/database'; // assuming your sequelize instance

class Genre extends Model {}

Genre.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'Genre',
  tableName: 'genres',
  timestamps: false, // Disable automatic timestamps
});

export default Genre;
