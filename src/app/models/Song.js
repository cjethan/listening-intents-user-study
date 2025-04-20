import mongoose from "mongoose";

const SongSchema = new mongoose.Schema({
  track_id: String,
  artist_name: String,
  track_uri: String,
  artist_uri: String,
  track_name: String,
  album_uri: String,
  duration_ms: Number,
  album_name: String,
}, { versionKey: false }
);

export default mongoose.models.Song || mongoose.model("Song", SongSchema);
