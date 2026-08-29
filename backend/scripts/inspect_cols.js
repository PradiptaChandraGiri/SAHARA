require('dotenv').config({ path: './backend/.env' });
const pool = require('../db/pool');

async function inspectCols() {
  const c = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'checkins'");
  console.log('checkins cols:', c.rows.map(r => r.column_name));
  const r = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'results'");
  console.log('results cols:', r.rows.map(r => r.column_name));
  process.exit(0);
}
inspectCols();
