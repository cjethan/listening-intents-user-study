import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

if (!process.env.POSTGRESQL_URI) {
  throw new Error("POSTGRESQL_URI is not defined in the environment variables.");
}

const sequelize = new Sequelize(process.env.POSTGRESQL_URI, {
  dialect: "postgres",
  logging: false,
  dialectModule: pg,
});

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

export { sequelize };
