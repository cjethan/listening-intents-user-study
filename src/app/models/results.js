import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../utils/database";

const UserResult = sequelize.define("UserResult", {
  user_id: { type: DataTypes.STRING, allowNull: false },
  prolific_id: { type: DataTypes.STRING, allowNull: false },
  genres: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  play_instrument: { type: DataTypes.ENUM('yes', 'ongoing', 'no'), allowNull: false },
  instruments_played: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  instruments_played_years: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  formal_education: { type: DataTypes.ENUM('yes', 'ongoing', 'no'), allowNull: false },
  compose_music: { type: DataTypes.ENUM('yes', 'no', 'occasionally'), allowNull: false },
  hours_listening_weekly: { type: DataTypes.INTEGER, defaultValue: 0 },
  intents: { type: DataTypes.JSON, defaultValue: {} },
}, {
  timestamps: false,
});

export default UserResult;
