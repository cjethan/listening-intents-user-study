import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../utils/database';

class IntentSong extends Model {}

IntentSong.init({
  intent_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'intents',
      key: 'id',
    },
    allowNull: false,
  },
  intent_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  track_id: DataTypes.STRING,
  artist_name: DataTypes.STRING,
  track_uri: DataTypes.STRING,
  artist_uri: DataTypes.STRING,
  track_name: DataTypes.STRING,
  album_uri: DataTypes.STRING,
  duration_ms: DataTypes.INTEGER,
  album_name: DataTypes.STRING,
}, {
  sequelize,
  modelName: 'IntentSong',
  tableName: 'intent_songs',
  timestamps: false,
});

export default IntentSong;
