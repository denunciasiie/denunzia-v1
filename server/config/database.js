import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

/**
 * PostgreSQL Connection (using postgres.js)
 * Replaces 'pg' pool for better IPv6/IPv4 handling and connection stability.
 */

const connectionString = process.env.DATABASE_URL;

console.log('----------------------------------------');
console.log('🔌 Database Config Check (postgres.js):');
console.log(`   URL Provided: ${!!connectionString}`);
console.log('----------------------------------------');

// Initialize postgres.js client
// It handles connection pooling automatically
const sql = postgres(connectionString, {
    ssl: { rejectUnauthorized: false }, // Allow self-signed certs (Supabase Pooler)
    max: 20,        // Max connections
    idle_timeout: 30,
    connect_timeout: 30, // 30s timeout
    // debug: (conn, query, params) => console.log('[DB]', query) // Uncomment for debug
});

/**
 * Execute a query compatible with 'pg' style (text, params)
 * Uses sql.unsafe() to allow raw query strings from existing code.
 */
export const query = async (text, params) => {
    const start = Date.now();
    try {
        // postgres.js returns an array-like object extended with command details
        const result = await sql.unsafe(text, params);

        const duration = Date.now() - start;
        // console.log('Executed query', { text, duration, rows: result.count });

        // Map postgres.js result to 'pg' result format expected by the app
        return {
            rows: result,
            rowCount: result.count,
            command: result.command,
            fields: result.columns
        };
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

/**
 * Mock getClient for compatibility.
 * 'postgres.js' handles pooling internally, so we don't need to manually checkout/release clients.
 * This returns a wrapper that mimics the pg client interface.
 */
export const getClient = async () => {
    // Return a proxy object that mimics a pg client
    return {
        query: async (text, params) => {
            return await query(text, params);
        },
        release: () => {
            // No-op: postgres.js manages connections
        },
        lastQuery: null
    };
};

/**
 * Close all database connections
 */
export const closePool = async () => {
    await sql.end();
    console.log('Database connections closed');
};

export default sql;
