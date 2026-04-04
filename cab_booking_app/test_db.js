const { Pool } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_wh50HzsVUkxg@ep-long-river-am4nu18u.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require";
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const res = await pool.query("SELECT * FROM admin");
    console.log("Current Admin rows:", res.rows);
    if (res.rows.length === 0) {
      console.log("Empty, inserting admin...");
      await pool.query("INSERT INTO admin (username, password) VALUES ($1, $2)", ['admin', 'admin123']);
      console.log("Admin inserted successfully.");
    }
  } catch (err) {
    console.error("Database error:", err.message);
  } finally {
    pool.end();
  }
})();
