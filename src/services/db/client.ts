import pg from "pg";
import env from "../../config.js";

export const client = new pg.Pool({
  host: env.DBHOST,
  port: env.DBPORT,
  user: env.DBUSER,
  password: env.DBPASS,
  database: env.DBNAME,
  max: 10, // Allow up to 10 connections
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 5000, // Wait 5 seconds before timing out
});

export const connectAndQuery = async () => {
  try {
    const pool = await client.connect();
    const res = await pool.query(`SELECT NOW()`);
    console.log("Connected to Supabase database at:", res.rows[0].now);
    pool.release(); // Release connection back to the pool
  } catch (err) {
    console.error("Database Connection Error:", err);
  }
};
