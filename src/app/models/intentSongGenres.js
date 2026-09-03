import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../utils/database';

class IntentSongGenre extends Model {}

IntentSongGenre.init({
  intent_song_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'intent_songs',
      key: 'id',
    },
    allowNull: false,
    primaryKey: true,
  },
  genre_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'genres',
      key: 'id',
    },
    allowNull: false,
    primaryKey: true,
  }
}, {
  sequelize,
  modelName: 'IntentSongGenre',
  tableName: 'intent_song_genres',
  timestamps: false,
});

export default IntentSongGenre;
