import mysql from "mysql2/promise";

const connectionString = process.env.DATABASE_URL || "mysql://root:@127.0.0.1:3306/cab_management";

let pool;

if (process.env.NODE_ENV === "production") {
  pool = mysql.createPool(connectionString);
} else {
  if (!global._mysqlPool) {
    global._mysqlPool = mysql.createPool({ 
      uri: connectionString,
      connectionLimit: 10,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
  }
  pool = global._mysqlPool;
}

export async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function exec(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result;
}

export { pool };
