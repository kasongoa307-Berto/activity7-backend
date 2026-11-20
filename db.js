const { Pool } = require("pg");

// Render databases require SSL. Set DB_SSL=false only for a local database without SSL.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false }
});

pool.on("error", (error) => {
  console.error("Unexpected database error:", error.message);
});

module.exports = pool;