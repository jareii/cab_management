import mysql from 'mysql2/promise';

async function migrate() {
  const connectionString = "mysql://root:admin123@127.0.0.1:3306/cab_management";
  try {
    const pool = mysql.createPool(connectionString);
    console.log("Connected to MySQL...");
    
    // Add created_at to drivers
    try {
      await pool.query("ALTER TABLE drivers ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP");
      console.log("Added created_at to drivers table.");
    } catch (e) {
      if(e.code === 'ER_DUP_FIELDNAME') console.log("created_at already exists in drivers.");
      else console.log("Error altering drivers:", e.message);
    }

    // Add columns to booking if missing from old schema
    try {
      await pool.query("ALTER TABLE booking ADD COLUMN distance_km DECIMAL(10,2) NULL");
      console.log("Added distance_km to booking table.");
    } catch(e) {}
    try {
      await pool.query("ALTER TABLE booking ADD COLUMN fare_amount DECIMAL(10,2) NULL");
      console.log("Added fare_amount to booking table.");
    } catch(e) {}
    try {
      await pool.query("ALTER TABLE booking ADD COLUMN payment_status VARCHAR(50) DEFAULT 'Not Paid'");
      console.log("Added payment_status to booking table.");
    } catch(e) {}
    try {
      await pool.query("ALTER TABLE booking ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
      console.log("Added updated_at to booking table.");
    } catch(e) {}
    try {
      await pool.query("ALTER TABLE booking ADD COLUMN user_phone VARCHAR(20)");
      console.log("Added user_phone to booking table.");
    } catch(e) {}

    console.log("Migration complete!");
    process.exit(0);
  } catch (error) {
    console.error("Connection failed:", error.message);
    process.exit(1);
  }
}
migrate();
