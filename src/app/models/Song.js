import { DataTypes } from "sequelize";
import sequelize from "@/app/utils/database";

const Song = sequelize.define("Song", {
  track_id: { type: DataTypes.STRING, primaryKey: true },
  artist_name: DataTypes.STRING,
  track_uri: DataTypes.STRING,
  artist_uri: DataTypes.STRING,
  track_name: DataTypes.STRING,
  album_uri: DataTypes.STRING,
  duration_ms: DataTypes.INTEGER,
  album_name: DataTypes.STRING,
  added_by_Userdata: DataTypes.INTEGER, // Optional field
  genres: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] }, // Array of genre names, can be empty
}, {
  tableName: "Songs", // Ensure the table name matches
  timestamps: false,
});

export default Song;
