require("dotenv").config();
const fs = require("fs");
const path = require("path");
const pool = require("./db");

async function setup() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    const seed = fs.readFileSync(path.join(__dirname, "seed.sql"), "utf8");

    await pool.query(schema);
    console.log("Table 'records' is ready.");

    await pool.query(seed);
    const result = await pool.query("SELECT COUNT(*) AS total FROM records");
    console.log("Records in the table: " + result.rows[0].total);
  } catch (error) {
    console.error("Setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

setup();