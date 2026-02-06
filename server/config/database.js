import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

/**
 * PostgreSQL Connection Pool
 * Manages database connections efficiently
 */
const poolConfig = {
    // Force SSL for Supabase connection (required)
    ssl: {
        rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000, // 30 seconds to connect
    family: 4, // Force IPv4 to avoid ENETUNREACH on Render (IPv6 issues)
};

// Prefer individual variables to avoid URL encoding issues with passwords
if (process.env.DB_HOST) {
    poolConfig.host = process.env.DB_HOST;
    poolConfig.port = process.env.DB_PORT || 5432;
    poolConfig.user = process.env.DB_USER;
    poolConfig.password = process.env.DB_PASSWORD;
    poolConfig.database = process.env.DB_NAME;
} else {
    poolConfig.connectionString = process.env.DATABASE_URL;
}

console.log('----------------------------------------');
console.log('🔌 Database Config Check:');
console.log(`   Host: ${poolConfig.host || 'Using connectionString'}`);
console.log(`   User: ${poolConfig.user || 'Unknown'}`);
console.log(`   Port: ${poolConfig.port || 'Default'}`);
console.log(`   DB:   ${poolConfig.database || 'Default'}`);
console.log('----------------------------------------');

const pool = new Pool(poolConfig);

// Test connection on startup
pool.on('connect', () => {
    console.log('✓ Database connected successfully');
});

pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
    process.exit(-1);
});

/**
 * Execute a query
 */
export const query = async (text, params) => {
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Executed query', { text, duration, rows: res.rowCount });
        return res;
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
    const query = client.query.bind(client);
    const release = client.release.bind(client);

    // Set a timeout of 5 seconds, after which we will log this client's last query
    const timeout = setTimeout(() => {
        console.error('A client has been checked out for more than 5 seconds!');
    }, 5000);

    // Monkey patch the query method to keep track of the last query executed
    client.query = (...args) => {
        client.lastQuery = args;
        return query(...args);
    };

    client.release = () => {
        clearTimeout(timeout);
        client.query = query;
        client.release = release;
        return release();
    };

    return client;
};

/**
 * Close all database connections
 */
export const closePool = async () => {
    await pool.end();
    console.log('Database pool closed');
};

export default pool;
