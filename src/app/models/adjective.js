const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // assuming your sequelize instance

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
});

export default Adjective;
