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
  songs: [songSchema],
}, { _id: false });

const userResultSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  age: Number,
  country: String,
  gender: String,
  genres: [String],
  intents: { type: Map, of: intentSchema },
});

export const userResult = mongoose.models.userResult || mongoose.model('userResult', userResultSchema);
