require('dotenv').config();
const pool = require('./db/pool');

async function inspect() {
  const tables = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  console.log('Neon Tables:', tables.rows.map(r => r.table_name));

  for (const t of tables.rows) {
    const cols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1
      ORDER BY ordinal_position;
    `, [t.table_name]);
    console.log(`\nTable [${t.table_name}]:`);
    cols.rows.forEach(c => console.log(`  - ${c.column_name}: ${c.data_type}`));
  }
}

inspect().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
