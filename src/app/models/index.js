import UserResult from './results.js';
import Genre from './genre.js';
import Instrument from './instrument.js';
import Adjective from './adjective.js';
import Intent from './intent.js';
import IntentSong from './intentSong.js';
import UserGenre from './userGenre.js';
import UserInstrument from './userInstruments.js';
import IntentAdjective from './intentAdjectives.js';

// Associations
UserResult.hasMany(UserGenre, { foreignKey: 'user_id', onDelete: 'CASCADE' });
UserResult.hasMany(UserInstrument, { foreignKey: 'user_id', onDelete: 'CASCADE' });
UserResult.hasMany(Intent, { foreignKey: 'user_id', onDelete: 'CASCADE' });

Genre.belongsToMany(UserResult, { through: UserGenre, foreignKey: 'genre_id' });
Instrument.belongsToMany(UserResult, { through: UserInstrument, foreignKey: 'instrument_id' });
Adjective.belongsToMany(Intent, { through: IntentAdjective, foreignKey: 'adjective_id' });
Intent.belongsToMany(Adjective, { through: IntentAdjective, foreignKey: 'intent_id' });

Intent.hasMany(IntentSong, { foreignKey: 'intent_id', onDelete: 'CASCADE' });
Intent.belongsTo(UserResult, { foreignKey: 'user_id' });

export {
  UserResult,
  Genre,
  Instrument,
  Adjective,
  Intent,
  IntentSong,
  UserGenre,
  UserInstrument,
  IntentAdjective,
};