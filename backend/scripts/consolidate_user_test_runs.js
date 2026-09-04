require('dotenv').config({ path: './backend/.env' });
const pool = require('../db/pool');

async function consolidate() {
  const userId = '336e0d0e-dffb-44ae-9035-343b636b0e2a';
  const resDistinct = await pool.query(
    `SELECT DISTINCT ON (created_at::date) id, created_at::date as date, overall_wellbeing
     FROM results
     WHERE user_id = $1
     ORDER BY created_at::date, created_at DESC`,
    [userId]
  );
  const keepIds = resDistinct.rows.map((r) => r.id);
  console.log('Unique active daily check-ins to keep:', keepIds.length);
  resDistinct.rows.forEach(r => console.log('Keep date:', r.date.toISOString().slice(0, 10), 'Score:', r.overall_wellbeing));

  const delRes = await pool.query(
    `DELETE FROM results WHERE user_id = $1 AND NOT (id = ANY($2::uuid[]))`,
    [userId, keepIds]
  );
  console.log('Pruned duplicate test check-ins:', delRes.rowCount);

  const remaining = await pool.query(`SELECT count(*) FROM results WHERE user_id = $1`, [userId]);
  console.log('Active check-ins preserved for Pradipta:', remaining.rows[0].count);
  await pool.end();
}

consolidate().catch(console.error);
