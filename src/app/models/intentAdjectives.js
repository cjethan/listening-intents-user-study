import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../utils/database';

class IntentAdjective extends Model {}

IntentAdjective.init({
  intent_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'intents',
      key: 'id',
    },
    allowNull: false,
    primaryKey: true,
  },
  adjective_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'adjectives',
      key: 'id',
    },
    allowNull: false,
    primaryKey: true,
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
  timestamps: false,
});

export default IntentAdjective;
