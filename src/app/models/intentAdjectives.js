const { Model, DataTypes } = require('sequelize');
import { sequelize } from '../utils/database'; // assuming your sequelize instance

class IntentAdjective extends Model {}

IntentAdjective.init({
  intent_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'intents',
      key: 'id',
    },
    allowNull: false,
  },
  adjective_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'adjectives',
      key: 'id',
    },
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'IntentAdjective',
  tableName: 'intent_adjectives',
  indexes: [
    {
      unique: true,
      fields: ['intent_id', 'adjective_id'],
    },
  ],
});

export default IntentAdjective;
