import { Sequelize, DataTypes } from "sequelize";
import sequelize from "../utils/database";
import UserResult from "./results";
import Genre from "./genre";

const UserGenre = sequelize.define("user_genres", {
  user_id: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: UserResult,
      key: "user_id",
    },
  },
  genre_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Genre,
      key: "id",
    },
  },
}, {
  timestamps: false,
});

UserResult.belongsToMany(Genre, { through: UserGenre, foreignKey: "user_id" });
Genre.belongsToMany(UserResult, { through: UserGenre, foreignKey: "genre_id" });

export default UserGenre;