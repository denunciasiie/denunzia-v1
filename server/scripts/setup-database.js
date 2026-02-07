import { query } from '../config/database.js';

/**
 * Database Schema Setup
 * Creates all necessary tables for the SIIEC system
 */

const createTablesSQL = `
-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(16) PRIMARY KEY,
    is_anonymous BOOLEAN NOT NULL DEFAULT true,
    role VARCHAR(100),
    category VARCHAR(100) NOT NULL,
    type VARCHAR(100) NOT NULL,
    custom_crime_type VARCHAR(100),
    
    -- Encrypted Data
    encrypted_data TEXT NOT NULL,
    encrypted_key TEXT NOT NULL,
    iv TEXT NOT NULL,
    algorithm VARCHAR(100) DEFAULT 'RSA-OAEP-4096 + AES-256-GCM',
    
    -- Location
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    address_street VARCHAR(255),
    address_colony VARCHAR(255),
    address_zipcode VARCHAR(10),
    address_references TEXT,
    
    -- Metadata
    timestamp TIMESTAMP NOT NULL,
    trust_score DECIMAL(3, 2),
    ai_analysis TEXT,
    
    -- Audit
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending',
    assigned_to VARCHAR(100),
    
    
    CONSTRAINT valid_trust_score CHECK (trust_score >= 0 AND trust_score <= 1)
);

-- Enable RLS on reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (anyone can submit a report)
-- Note: The backend connects as a superuser/admin so it bypasses RLS, 
-- but this protects the table from direct public API access if exposed via PostgREST
DROP POLICY IF EXISTS "Enable insert for everyone" ON reports;
CREATE POLICY "Enable insert for everyone" ON reports FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Enable read for admins only" ON reports;
CREATE POLICY "Enable read for admins only" ON reports FOR SELECT USING (false); -- Implicitly denies public read

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    role VARCHAR(50) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES admin_users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSONB,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Evidence Files Table (for future file uploads)
CREATE TABLE IF NOT EXISTS evidence_files (
    id SERIAL PRIMARY KEY,
    report_id VARCHAR(16) REFERENCES reports(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_size INTEGER,
    encrypted_path TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_reports_timestamp ON reports(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

/**
 * Setup database schema
 */
export const setupDatabase = async () => {
    try {
        console.log('🔧 Setting up database schema...');

        await query(createTablesSQL);

        console.log('✓ Database schema created successfully');
        console.log('✓ Tables: reports, admin_users, audit_logs, evidence_files');
        console.log('✓ Indexes created for performance');
        console.log('✓ Triggers configured');

        return true;
    } catch (error) {
        console.error('❌ Error setting up database:', error);
        throw error;
    }
};

/**
 * Check if database is ready
 */
export const checkDatabaseHealth = async () => {
    try {
        const result = await query('SELECT NOW() as current_time');
        console.log('✓ Database health check passed:', result.rows[0].current_time);
        return true;
    } catch (error) {
        console.error('❌ Database health check failed:', error);
        return false;
    }
};

/**
 * Get database statistics
 */
export const getDatabaseStats = async () => {
    try {
        const stats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM reports) as total_reports,
        (SELECT COUNT(*) FROM admin_users WHERE is_active = true) as active_admins,
        (SELECT COUNT(*) FROM audit_logs WHERE timestamp > NOW() - INTERVAL '24 hours') as logs_24h
    `);

        return stats.rows[0];
    } catch (error) {
        console.error('Error getting database stats:', error);
        return null;
    }
};
