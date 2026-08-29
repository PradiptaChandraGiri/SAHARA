require('dotenv').config({ path: './backend/.env' });
const pool = require('../db/pool');

async function syncUsers() {
  try {
    const googleUser = await pool.query("SELECT id FROM users WHERE email = 'giripradiptachandra@gmail.com'");
    const githubUser = await pool.query("SELECT id FROM users WHERE email = 'PradiptaChandraGiri@github.local'");
    
    console.log('Google User:', googleUser.rows);
    console.log('GitHub User:', githubUser.rows);

    if (googleUser.rows.length > 0 && githubUser.rows.length > 0) {
      const gId = googleUser.rows[0].id;
      const ghId = githubUser.rows[0].id;

      const res = await pool.query('UPDATE results SET user_id = $1 WHERE user_id = $2', [gId, ghId]);
      console.log('Updated results count:', res.rowCount);

      const checkins = await pool.query('UPDATE checkins SET user_id = $1 WHERE user_id = $2', [gId, ghId]);
      console.log('Updated checkins count:', checkins.rowCount);
    }
    
    const countResults = await pool.query("SELECT count(*) FROM results WHERE user_id = '336e0d0e-dffb-44ae-9035-343b636b0e2a'");
    console.log('Total results for giripradiptachandra@gmail.com:', countResults.rows[0].count);

    process.exit(0);
  } catch (err) {
    console.error('Error syncing user data:', err);
    process.exit(1);
  }
}

syncUsers();
