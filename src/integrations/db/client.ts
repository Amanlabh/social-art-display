
import { Pool } from 'pg';

// Create a PostgreSQL connection pool to Neon DB
export const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_1C4YNXgxeZln@ep-dry-cake-a4zbjonp-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

// Helper function for running SQL queries
export async function query(text: string, params: any[] = []) {
  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}
