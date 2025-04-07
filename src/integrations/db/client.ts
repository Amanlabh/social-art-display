
import { Pool, PoolClient } from 'pg';
import { MockQueryResult } from './types';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: import.meta.env.VITE_DATABASE_URL || 
    'postgresql://postgres:postgres@db.example.com:5432/portfolio',
  ssl: {
    rejectUnauthorized: false // Required for Neon's SSL
  }
});

// Log successful connection
pool.on('connect', client => {
  console.log('Connected to PostgreSQL database');
});

// Log errors
pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

// Helper function for running SQL queries
export async function query(text: string, params: any[] = []): Promise<MockQueryResult> {
  console.log('Executing query:', { text, params });
  
  try {
    const result = await pool.query(text, params);
    return {
      rows: result.rows,
      rowCount: result.rowCount
    };
  } catch (error: any) {
    console.error('Database query error:', error.message);
    throw error;
  }
}

// Get a client from the pool for transactions
export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

// Mock function to maintain compatibility with the old mock implementation
export function addMockData(table: 'users' | 'portfolios' | 'images', data: any) {
  console.warn('addMockData is deprecated, please insert data using real queries');
  
  // Convert mock data to proper INSERT query
  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
  
  const sql = `
    INSERT INTO ${table} (${columns.join(', ')})
    VALUES (${placeholders})
    ON CONFLICT (id) DO UPDATE
    SET ${columns.map((col, i) => `${col} = $${i + 1}`).join(', ')}
    RETURNING *
  `;
  
  return query(sql, values);
}
