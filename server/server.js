import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { query, closePool } from './config/database.js';
import { setupDatabase, checkDatabaseHealth, getDatabaseStats } from './scripts/setup-database.js';
import { decryptData, validatePayloadSize, sanitizeDecryptedData, isDecryptionAvailable } from './services/decryptionService.js';
import swaggerUi from 'swagger-ui-express';
import { specs } from './swaggerConfig.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ==================== MIDDLEWARE ====================

// Security headers
// Security headers (High Security Configuration)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"], // Disallow inline scripts for strict CSP
            styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for UI components
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"], // No plugins
            mediaSrc: ["'none'"],
            frameAncestors: ["'none'"], // Prevent Clickjacking
            formAction: ["'self'"],
            upgradeInsecureRequests: [], // Force HTTPS
        },
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
    dnsPrefetchControl: { allow: false }, // Prevent data leakage
    frameguard: { action: "deny" }, // Deny iframe embedding
    hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true // Enable XSS filter for older browsers
}));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5173'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Body parser
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// ==================== ROUTES ====================

/**
 * Health check endpoint
 */
app.get('/api/health', async (req, res) => {
    try {
        const dbHealthy = await checkDatabaseHealth();
        const decryptionAvailable = isDecryptionAvailable();

        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: dbHealthy ? 'connected' : 'disconnected',
            decryption: decryptionAvailable ? 'available' : 'unavailable',
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Health check failed'
        });
    }
});

/**
 * Get database statistics (admin only)
 */
app.get('/api/stats', async (req, res) => {
    try {
        const stats = await getDatabaseStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get statistics' });
    }
});

/**
 * POST /api/reports - Submit a new encrypted report
 */
/**
 * @swagger
 * /api/reports:
 *   post:
 *     summary: Enviar una nueva denuncia cifrada
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Report'
 *     responses:
 *       201:
 *         description: Reporte creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 id:
 *                   type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Datos faltantes o inválidos
 *       500:
 *         description: Error del servidor
 */
app.post('/api/reports', async (req, res) => {
    try {
        console.log('[API] POST /api/reports - Received request');
        console.log('[API] Request body keys:', Object.keys(req.body));
        console.log('[API] Has encryptedData:', !!req.body.encryptedData);
        console.log('[API] Has encryptedKey:', !!req.body.encryptedKey);
        console.log('[API] Has iv:', !!req.body.iv);

        const {
            id,
            isAnonymous,
            role,
            category,
            type,
            customCrimeType,
            encryptedData,
            encryptedKey,
            iv,
            algorithm,
            location,
            timestamp,
            trustScore,
            aiAnalysis
        } = req.body;

        // Validate required fields
        if (!id || !category || !type || !encryptedData || !encryptedKey || !iv) {
            console.error('[API] Missing required fields:', {
                id: !!id,
                category: !!category,
                type: !!type,
                encryptedData: !!encryptedData,
                encryptedKey: !!encryptedKey,
                iv: !!iv
            });
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['id', 'category', 'type', 'encryptedData', 'encryptedKey', 'iv']
            });
        }

        // Validate payload size
        validatePayloadSize({ encryptedData, encryptedKey, iv });

        // Decrypt sensitive data (optional - can store encrypted)
        let decryptedData = null;
        try {
            if (isDecryptionAvailable()) {
                decryptedData = decryptData({ encryptedData, encryptedKey, iv, algorithm });
                decryptedData = sanitizeDecryptedData(decryptedData);
                console.log('✓ Report data decrypted and sanitized');
            }
        } catch (decryptError) {
            console.warn('⚠️ Could not decrypt data, storing encrypted:', decryptError.message);
            // Continue - we'll store encrypted data
        }

        // Insert into database
        const result = await query(`
      INSERT INTO reports (
        id, is_anonymous, role, category, type, custom_crime_type,
        encrypted_data, encrypted_key, iv, algorithm,
        latitude, longitude, address_street, address_colony, address_zipcode, address_references,
        timestamp, trust_score, ai_analysis, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING id, created_at
    `, [
            id,
            isAnonymous ?? true,
            role,
            category,
            type,
            customCrimeType,
            encryptedData,
            encryptedKey,
            iv,
            algorithm || 'RSA-OAEP-4096 + AES-256-GCM',
            location?.lat,
            location?.lng,
            location?.details?.street || decryptedData?.addressDetails?.street,
            location?.details?.colony || decryptedData?.addressDetails?.colony,
            location?.details?.zipCode || decryptedData?.addressDetails?.zipCode,
            location?.details?.references || decryptedData?.addressDetails?.references,
            timestamp || new Date().toISOString(),
            trustScore,
            aiAnalysis,
            'pending'
        ]);

        console.log(`✓ Report ${id} saved to database`);

        res.status(201).json({
            success: true,
            id: result.rows[0].id,
            createdAt: result.rows[0].created_at,
            message: 'Report submitted successfully'
        });

    } catch (error) {
        console.error('Error saving report:', error);
        res.status(500).json({
            error: 'Failed to save report',
            message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

/**
 * GET /api/reports - Get all reports (admin only - add auth later)
 */
app.get('/api/reports', async (req, res) => {
    try {
        const { limit = 100, offset = 0, status, category } = req.query;

        let queryText = `
      SELECT 
        id, is_anonymous, role, category, type, custom_crime_type,
        latitude, longitude, address_street, address_colony,
        timestamp, trust_score, ai_analysis, status, created_at
      FROM reports
      WHERE 1=1
    `;
        const params = [];
        let paramCount = 1;

        if (status) {
            queryText += ` AND status = $${paramCount}`;
            params.push(status);
            paramCount++;
        }

        if (category) {
            queryText += ` AND category = $${paramCount}`;
            params.push(category);
            paramCount++;
        }

        queryText += ` ORDER BY timestamp DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(parseInt(limit), parseInt(offset));

        const result = await query(queryText, params);

        res.json({
            success: true,
            count: result.rows.length,
            reports: result.rows
        });

    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports' });
    }
});

/**
 * GET /api/reports/:id - Get specific report with decrypted data (admin only)
 */
app.get('/api/reports/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(`
      SELECT * FROM reports WHERE id = $1
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }

        const report = result.rows[0];

        // Decrypt data if available
        if (isDecryptionAvailable()) {
            try {
                const decryptedData = decryptData({
                    encryptedData: report.encrypted_data,
                    encryptedKey: report.encrypted_key,
                    iv: report.iv,
                    algorithm: report.algorithm
                });

                report.decrypted_narrative = decryptedData.narrative;
                report.decrypted_entities = decryptedData.entities;
            } catch (decryptError) {
                console.warn('Could not decrypt report data:', decryptError.message);
            }
        }

        res.json({
            success: true,
            report
        });

    } catch (error) {
        console.error('Error fetching report:', error);
        res.status(500).json({ error: 'Failed to fetch report' });
    }
});

/**
 * PATCH /api/reports/:id - Update report status (admin only)
 */
app.patch('/api/reports/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, assignedTo, trustScore } = req.body;

        const updates = [];
        const params = [];
        let paramCount = 1;

        if (status) {
            updates.push(`status = $${paramCount}`);
            params.push(status);
            paramCount++;
        }

        if (assignedTo) {
            updates.push(`assigned_to = $${paramCount}`);
            params.push(assignedTo);
            paramCount++;
        }

        if (trustScore !== undefined) {
            updates.push(`trust_score = $${paramCount}`);
            params.push(trustScore);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No updates provided' });
        }

        params.push(id);

        const result = await query(`
      UPDATE reports 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING id, status, updated_at
    `, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Report not found' });
        }

        res.json({
            success: true,
            report: result.rows[0]
        });

    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({ error: 'Failed to update report' });
    }
});

/**
 * DELETE /api/reports/cleanup - Delete all reports (admin only - for testing)
 */
app.delete('/api/reports/cleanup', async (req, res) => {
    try {
        console.log('[ADMIN] Cleanup request - deleting all reports');

        const result = await query('DELETE FROM reports RETURNING id');

        console.log(`[ADMIN] Deleted ${result.rowCount} reports`);

        res.json({
            success: true,
            deleted: result.rowCount,
            message: `Successfully deleted ${result.rowCount} reports`
        });

    } catch (error) {
        console.error('Error during cleanup:', error);
        res.status(500).json({ error: 'Failed to cleanup reports' });
    }
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ==================== SERVER STARTUP ====================

const startServer = async () => {
    try {
        // Check database connection
        console.log('🔍 Checking database connection...');
        const dbHealthy = await checkDatabaseHealth();

        if (!dbHealthy) {
            console.error('❌ Database connection failed. Please check your configuration.');
            process.exit(1);
        }

        // Setup database schema (creates tables if they don't exist)
        console.log('🔧 Setting up database schema...');
        await setupDatabase();

        // Check decryption availability
        if (isDecryptionAvailable()) {
            console.log('✓ Decryption service available');
        } else {
            console.warn('⚠️ Decryption service unavailable - reports will be stored encrypted only');
        }

        // Start server
        app.listen(PORT, () => {
            console.log('');
            console.log('═══════════════════════════════════════════════════════');
            console.log(`🚀 SIIEC Backend Server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 API: http://localhost:${PORT}/api`);
            console.log(`💚 Health: http://localhost:${PORT}/api/health`);
            console.log('═══════════════════════════════════════════════════════');
            console.log('');
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing server gracefully...');
    await closePool();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\nSIGINT received, closing server gracefully...');
    await closePool();
    process.exit(0);
});

// Start the server
startServer();
