const mysql = require("mysql2/promise");

async function check() {
  try {
    const conn = await mysql.createConnection("mysql://root:@127.0.0.1:3306/cab_management");
    await conn.execute("SELECT 1");
    console.log("MYSQL IS ACCEPTING CONNECTIONS");
    await conn.end();
  } catch (e) {
    console.log("MYSQL ERROR: " + e.message);
  }
  process.exit(0);
}

check();
