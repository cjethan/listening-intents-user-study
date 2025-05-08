import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import pg from "pg"; // Import the pg module for PostgreSQL

dotenv.config();

if (!process.env.POSTGRESQL_URI) {
  throw new Error("POSTGRESQL_URI is not defined in the environment variables."); // Ensure this variable is set
}

const sequelize = new Sequelize(process.env.POSTGRESQL_URI, {
  dialect: "postgres",
  logging: false,
  dialectModule: pg,
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    await sequelize.sync({ alter: true }); // Synchronize models
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

export { sequelize };
