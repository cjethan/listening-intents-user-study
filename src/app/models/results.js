import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../utils/database'; // Ensure this path is correct

class UserResult extends Model {}

UserResult.init({
  user_id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  prolific_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  play_instrument: {
    type: DataTypes.ENUM('yes', 'ongoing', 'no'),
    allowNull: false,
  },
  formal_education: {
    type: DataTypes.ENUM('yes', 'ongoing', 'no'),
    allowNull: false,
  },
  compose_music: {
    type: DataTypes.ENUM('yes', 'no', 'occasionally'),
    allowNull: false,
  },
  hours_listening_daily: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  instruments_played_years: {
    type: DataTypes.ENUM(
      'less than 1 year',
      '1-2 years',
      '3-5 years',
      '6-10 years',
      'more than 10 years'
    ),
    allowNull: true, // Allow null values
  }
}, {
  sequelize, // Ensure the sequelize instance is passed here
  modelName: 'UserResult',
  tableName: 'user_results',
  timestamps: false,
});

export default UserResult; // Change to default export
