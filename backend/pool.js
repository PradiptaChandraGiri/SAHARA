// db/pool.js
// Single shared connection pool - created once when the server starts,
// reused for every request. Never create a new Pool per request.

const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon requires SSL
  max: 10, // reasonable for a small app; raise if you see connection exhaustion
});

pool.on("error", (err) => {
  console.error("Unexpected Postgres pool error:", err);
});

module.exports = pool;
