import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import pg from "pg"; // Import the pg module for PostgreSQL

dotenv.config();

const sequelize = new Sequelize(process.env.POSTGRESQL_URI, {
  dialect: "postgres", // Ensure this is set to "postgres"
  logging: false, // Disable logging for cleaner output,
  dialectModule: pg
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    // Synchronize all models
    await sequelize.sync({ alter: true }); // Use { force: true } to drop and recreate tables
    console.log("All models were synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

export default sequelize;
