import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../utils/database.js";

const UserResult = sequelize.define("user_results", {
  user_id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
  },
  prolific_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  play_instrument: {
    type: DataTypes.ENUM('yes', 'ongoing', 'no'),
    allowNull: false,
  },
  instruments_played: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  instruments_played_years: {
    type: DataTypes.ENUM(
      'less_than_1_year',
      '_1_2_years',
      '_3_5_years',
      '_6_10_years',
      'more_than_10_years'
    ),
    allowNull: true,
  },
  formal_education: {
    type: DataTypes.ENUM('yes', 'ongoing', 'no'),
    allowNull: false,
  },
  compose_music: {
    type: DataTypes.ENUM('yes', 'no', 'occasionally'),
    allowNull: false,
  },
  hours_listening_weekly: {
    type: DataTypes.INTEGER,
  },
  intents: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
}, {
  timestamps: false,
});

export default UserResult;
