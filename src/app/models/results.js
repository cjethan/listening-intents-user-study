import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
  track_id: String,
  artist_name: String,
  track_uri: String,
  artist_uri: String,
  track_name: String,
  album_uri: String,
  duration_ms: Number,
  album_name: String,
}, { _id: false }); // _id: false so Mongo doesn't auto-create _id for subdocuments

const intentSchema = new mongoose.Schema({
  intent_name: String,
  how_often: String,
  how_imp: String,
  adjectives: [String], // Add adjectives field
  songs: [songSchema],
}, { _id: false });

const userResultSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  prolific_id: { type: String, required: true },
  genres: { type: [String], default: [] },
  play_instrument: { type: String, enum: ['yes', 'ongoing', 'no'], required: true },
  instruments_played: { type: [String], default: [] },
  instruments_played_years: { type: [String], default: [] },
  formal_education: { type: String, enum: ['yes', 'ongoing', 'no'], required: true }, // Added 'yes, ongoing'
  compose_music: { type: String, enum: ['yes', 'no', 'occasionally'], required: true },
  hours_listening_weekly: { type: Number, default: 0 },
  intents: { type: Map, of: intentSchema, default: {} },
});

export const userResult = mongoose.models.userResult || mongoose.model('userResult', userResultSchema);
