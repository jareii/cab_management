import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING;
const pool = new Pool({
  connectionString,
  ssl: connectionString && connectionString.includes("sslmode=require")
    ? { rejectUnauthorized: false }
    : undefined,
});

const toPgPlaceholders = (sql) => {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
};

export async function query(sql, params = []) {
  const text = toPgPlaceholders(sql);
  const result = await pool.query(text, params);
  return result.rows;
}

export async function exec(sql, params = []) {
  const text = toPgPlaceholders(sql);
  const result = await pool.query(text, params);
  return result;
}
