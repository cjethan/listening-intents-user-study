const { Model, DataTypes } = require('sequelize');
import { sequelize } from '../utils/database'; // assuming your sequelize instance

class IntentSongGenre extends Model {}

IntentSongGenre.init({
  intent_song_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'intent_songs',
      key: 'id',
    },
    allowNull: false,
    primaryKey: true, // Part of the composite primary key
  },
  genre_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'genres',
      key: 'id',
    },
    allowNull: false,
    primaryKey: true, // Part of the composite primary key
  }
}, {
  sequelize,
  modelName: 'IntentSongGenre',
  tableName: 'intent_song_genres',
  timestamps: false,
});

export default IntentSongGenre;
