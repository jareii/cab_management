import mysql from 'mysql2/promise';

const pool: mysql.Pool = globalThis._mysqlPool || mysql.createPool({
  host: process.env.MYSQLHOST || 'localhost',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database: process.env.MYSQLDATABASE || 'cabmanagement',
  port: parseInt(process.env.MYSQLPORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

if (process.env.NODE_ENV !== 'production') {
  globalThis._mysqlPool = pool;
}

export default pool;

// Extend global namespace to prevent multiple connections in dev
declare global {
  var _mysqlPool: mysql.Pool | undefined;
}
