import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prepare connection config
const connectionConfig = {
    connectionString: process.env.DATABASE_URL,
    // Add SSL only if sslmode=disable is NOT in the URL
    ...(process.env.DATABASE_URL.includes('sslmode=disable') ? {} : {
        ssl: {
            rejectUnauthorized: false
        }
    })
};

const pool = new Pool(connectionConfig);

const query = (text, params) => pool.query(text, params);
const closePool = () => pool.end();

/**
 * Executes the security hardening SQL script
 */
const runSecurityFix = async () => {
    try {
        console.log('🛡️ Starting database security hardening...');

        const sqlPath = path.join(__dirname, 'fix-security.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📜 Executing SQL hardening script...');
        await query(sql);

        console.log('✅ Security vulnerabilities fixed successfully!');

        // Final verification check
        const rlsStatus = await query(`
            SELECT tablename, rowsecurity 
            FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename IN ('reports', 'admin_users', 'audit_logs', 'evidence_files');
        `);

        console.log('\n📊 Current RLS Status:');
        rlsStatus.rows.forEach(row => {
            console.log(`   - ${row.tablename}: ${row.rowsecurity ? '✅ ENABLED' : '❌ DISABLED'}`);
        });

        // Verification for Function Search Path
        const funcStatus = await query(`
            SELECT proname, proconfig 
            FROM pg_proc 
            WHERE proname = 'update_updated_at_column';
        `);
        const hasSearchPath = funcStatus.rows[0]?.proconfig?.some(c => c.includes('search_path=public'));
        console.log(`   - Function update_updated_at_column path: ${hasSearchPath ? '✅ SECURE' : '❌ INSECURE'}`);

    } catch (error) {
        console.error('❌ Error applying security fixes:', error.message);
        if (error.detail) console.error('   Detail:', error.detail);
    } finally {
        await closePool();
        process.exit(0);
    }
};

runSecurityFix();
