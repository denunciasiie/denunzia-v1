import pg from 'pg';
import dotenv from 'dotenv';
import { URL } from 'url';

dotenv.config();

const { Pool } = pg;

// Parse and log the connection details for debugging
if (process.env.DATABASE_URL) {
    try {
        const dbUrl = new URL(process.env.DATABASE_URL);
        console.log('----------------------------------------');
        console.log('🔌 Database Config Check (pg):');
        console.log(`   Host: ${dbUrl.hostname}`);
        console.log(`   Port: ${dbUrl.port} (Should be 6543 for Pooler)`);
        console.log(`   User: ${dbUrl.username}`);
        console.log('----------------------------------------');
    } catch (e) {
        console.error('⚠️ Could not parse DATABASE_URL for logging:', e.message);
    }
}

/**
 * PostgreSQL Connection Pool (using pg)
 * Configured for Supabase Transaction Pooler compatibility
 */
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Required for Supabase (self-signed certs in pooler)
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    family: 4 // CRITICAL: Force IPv4 to prevent ENETUNREACH on Render
});

pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
});

/**
 * Execute a query
 */
export const query = async (text, params) => {
    try {
        return await pool.query(text, params);
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

/**
 * Get a client from the pool for transactions
 */
export const getClient = async () => {
    const client = await pool.connect();
    const query = client.query;
    const release = client.release;

    // Monkey patch query to track last query if needed
    // Simple implementation for now
    client.query = (...args) => client.query(...args);

    return client;
};

export const closePool = async () => {
    await pool.end();
};

export default pool;
