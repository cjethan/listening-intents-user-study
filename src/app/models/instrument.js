const { Model, DataTypes } = require('sequelize');
import { sequelize } from '../utils/database'; // assuming your sequelize instance

class Instrument extends Model {}

Instrument.init({
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
  modelName: 'Instrument',
  tableName: 'instruments',
  timestamps: false,
});

export default Instrument;
