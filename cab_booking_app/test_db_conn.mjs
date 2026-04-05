import mysql from 'mysql2/promise';
import fs from 'fs';

let output = "Analyzing your MySQL Connection...\n";

async function testConnection(pwd, port = 3306) {
  try {
    const connectionString = `mysql://root:${pwd}@127.0.0.1:${port}/cab_management`;
    const pool = mysql.createPool(connectionString);
    await pool.query("SELECT 1");
    output += `SUCCESS! Connected with password: "${pwd}" on port ${port}\n`;
    return true;
  } catch (e) {
    output += `FAILED with password: "${pwd}" on port ${port} -> ${e.message}\n`;
    return false;
  }
}

async function run() {
  let success = await testConnection('Jareena2004', 3306);
  if (!success) success = await testConnection('', 3306);
  if (!success) success = await testConnection('root', 3306);
  if (!success) success = await testConnection('admin', 3306);
  if (!success) success = await testConnection('admin123', 3306);
  
  if (!success) success = await testConnection('Jareena2004', 3307);
  if (!success) success = await testConnection('', 3307);
  
  fs.writeFileSync('db_test_utf8.txt', output, 'utf8');
  process.exit(0);
}
run();
