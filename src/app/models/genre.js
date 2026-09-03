import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../utils/database';

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
  timestamps: false,
});

export default Genre;
