import mysql from 'mysql2/promise';

async function fixAutoIncrement() {
  const connectionString = "mysql://root:admin123@127.0.0.1:3306/cab_management";
  try {
    const pool = mysql.createPool(connectionString);
    console.log("Connected to MySQL to fix AUTO_INCREMENT...");

    await pool.query("SET FOREIGN_KEY_CHECKS=0");

    const tables = [
      { table: 'admin', col: 'admin_id' },
      { table: 'users', col: 'user_id' },
      { table: 'drivers', col: 'driver_id' },
      { table: 'cabs', col: 'cab_id' },
      { table: 'booking', col: 'booking_id' }
    ];

    for (let t of tables) {
      try {
        await pool.query(`ALTER TABLE ${t.table} MODIFY ${t.col} INT AUTO_INCREMENT`);
        console.log(`Added AUTO_INCREMENT to ${t.table}.${t.col}`);
      } catch (e) {
        console.log(`Could not alter ${t.table}.${t.col}: ${e.message}`);
      }
    }

    await pool.query("SET FOREIGN_KEY_CHECKS=1");

    console.log("AUTO_INCREMENT fix complete!");
    process.exit(0);
  } catch (error) {
    console.error("Connection failed:", error.message);
    process.exit(1);
  }
}
fixAutoIncrement();
