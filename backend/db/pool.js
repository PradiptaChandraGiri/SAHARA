// db/pool.js — resilient Neon Postgres pool
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  max: 10,
});

pool.on("error", (err) => {
  console.error("Unexpected Postgres pool error:", err);
});

module.exports = pool;
