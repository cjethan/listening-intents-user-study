import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../utils/database';

class UserGenre extends Model {}

UserGenre.init({
  user_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    references: {
      model: 'user_results',
      key: 'user_id',
    },
    allowNull: false,
  },
  genre_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'genres',
      key: 'id',
    },
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'UserGenre',
  tableName: 'user_genres',
  timestamps: false,
});

export default UserGenre;
