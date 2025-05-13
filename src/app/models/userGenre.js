import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../utils/database'; // assuming your sequelize instance

class UserGenre extends Model {}

UserGenre.init({
  user_id: {
    type: DataTypes.STRING,
    primaryKey: true, // Part of the composite primary key
    references: {
      model: 'user_results',
      key: 'user_id',
    },
    allowNull: false,
  },
  genre_id: {
    type: DataTypes.INTEGER,
    primaryKey: true, // Part of the composite primary key
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
  timestamps: false, // Disable automatic timestamps
});

export default UserGenre;
