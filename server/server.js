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
import multer from 'multer';
import { uploadToPinata } from './services/pinataService.js';
import crypto from 'crypto';
import sharp from 'sharp';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy - Required for Render and other cloud platforms
app.set('trust proxy', 1);

// ==================== MIDDLEWARE ====================

// Security headers
// Security headers (High Security Configuration)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:", "https://*.tile.openstreetmap.org"],
            connectSrc: ["'self'", "https://denunzia-v1.onrender.com", "https://nominatim.openstreetmap.org", "https://denunzia.org"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'none'"],
            frameAncestors: ["'none'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginEmbedderPolicy: false, // Disabled to allow cross-origin images/resources
    crossOriginOpenerPolicy: { policy: "unsafe-none" },
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Enabled for CORS support
    dnsPrefetchControl: { allow: false },
    frameguard: { action: "deny" },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true
}));

// CORS configuration
// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:4173',
    'https://denunziasiie.github.io',
    'https://denunzia.org',
    'https://denunzia-v1.onrender.com', // Added Render URL
    'https://denunziasiie.vercel.app' // Potential Vercel deployment
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            console.warn(`[CORS] Rejected origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
// Standard limiter for most routes
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter limiter for report submissions (2 per minute per IP)
const reportLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 2,
    message: 'Límite de denuncias excedido. Por favor espera un minuto antes de intentar de nuevo.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', generalLimiter);
app.use('/api/reports', reportLimiter);

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
// Multer setup for file uploads is now at the top.
// Middleware configuration below:

// Memory storage to process files before upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Helper to encrypt CIDs server-side (for evidence_files table)
// Using a server-side secret key (e.g., from ENV or derived)
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || 'default_secret_key_change_in_production_32bytes';
const encryptCID = (cid) => {
    const iv = crypto.randomBytes(16);
    // Ensure key is 32 bytes
    const key = crypto.createHash('sha256').update(String(ENCRYPTION_SECRET)).digest();
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(cid, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

/**
 * GET /api/geocode/reverse - Reverse geocoding proxy to avoid CORS
 */
app.get('/api/geocode/reverse', async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ error: 'Missing lat or lon parameters' });
        }

        // Fetch from Nominatim
        const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
        const response = await fetch(nominatimUrl, {
            headers: {
                'User-Agent': 'DenunZIA/1.0 (https://denunzia.org)',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Nominatim API error: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Geocoding error:', error);
        res.status(500).json({ error: 'Geocoding service unavailable' });
    }
});

/**
 * GET /api/geocode/search - Geocoding search proxy to avoid CORS
 */
app.get('/api/geocode/search', async (req, res) => {
    try {
        const { q, limit = 5 } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Missing query parameter' });
        }

        const query = encodeURIComponent(q);
        const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=mx&addressdetails=1&limit=${limit}`;

        const response = await fetch(nominatimUrl, {
            headers: {
                'User-Agent': 'DenunZIA/1.0 (https://denunzia.org)',
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Nominatim API error: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Search geocoding error:', error);
        res.status(500).json({ error: 'Search service unavailable' });
    }
});

/**
 * POST /api/reports - Submit a new encrypted report with files
 */
app.post('/api/reports', upload.array('files'), async (req, res) => {
    try {
        console.log('[API] POST /api/reports - Received request');

        const reCaptchaToken = req.headers['x-recaptcha-token'];
        const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET;

        // Verify reCAPTCHA if secret is configured
        if (RECAPTCHA_SECRET && reCaptchaToken) {
            try {
                const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${reCaptchaToken}`;
                const verifyRes = await fetch(verifyUrl, { method: 'POST' });
                const verifyData = await verifyRes.json();

                if (!verifyData.success || verifyData.score < 0.5) {
                    console.warn(`[SECURITY] reCAPTCHA failed. Score: ${verifyData.score}`);
                    return res.status(403).json({ error: 'Security verification failed' });
                }
            } catch (captchaErr) {
                console.error('reCAPTCHA verification error:', captchaErr);
                // Continue if service is down, but log it
            }
        } else if (RECAPTCHA_SECRET && !reCaptchaToken) {
            return res.status(403).json({ error: 'Security token missing' });
        }

        let body = req.body;

        // Determine if request is multipart (files) or JSON
        if (req.body.payload) {
            // Multipart/Form-Data: Metadata is in 'payload' string
            try {
                body = JSON.parse(req.body.payload);
            } catch (e) {
                console.error('Failed to parse payload JSON from FormData:', e);
                return res.status(400).json({ error: 'Invalid JSON payload in FormData' });
            }
        } else {
            // Standard JSON request
            body = req.body;
        }

        const {
            id,
            isAnonymous,
            role,
            category,
            type,
            customCrimeType,
            encryptedData, // Now contains ONLY metadata
            encryptedKey,
            iv,
            algorithm,
            location,
            timestamp,
            trustScore,
            aiAnalysis,
            narrativa_real,
            website_url // Honeypot field
        } = body;

        // Honeypot check: If bot fills this invisible field, silent reject
        if (website_url) {
            console.warn(`[SECURITY] Honeypot triggered for report ${id || 'unknown'}`);
            return res.status(201).json({ success: true, message: 'Report submitted successfully' }); // Pretend success
        }

        const files = req.files || [];
        console.log(`[API] Processing report ${id} with ${files.length} files`);

        // Validate required fields
        if (!id || !category || !type || !encryptedData || !encryptedKey || !iv) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['id', 'category', 'type', 'encryptedData', 'encryptedKey', 'iv']
            });
        }

        // 1. Insert Report (Metadata)
        const result = await query(`
          INSERT INTO reports (
            id, is_anonymous, role, category, type, custom_crime_type, narrativa_real,
            encrypted_data, encrypted_key, iv, algorithm,
            latitude, longitude, address_street, address_colony, address_zipcode, address_references,
            timestamp, trust_score, ai_analysis, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
          RETURNING id, created_at
        `, [
            id, isAnonymous ?? true, role, category, type, customCrimeType, narrativa_real,
            encryptedData, encryptedKey, iv, algorithm || 'RSA-OAEP-4096 + AES-256-GCM',
            location?.lat, location?.lng,
            location?.details?.street, location?.details?.colony, location?.details?.zipCode, location?.details?.references,
            timestamp || new Date().toISOString(),
            trustScore ? parseFloat(trustScore) : null, aiAnalysis, 'pending'
        ]);

        // 2. Process Files -> EXIF Cleanup -> Pinata -> Evidence Table
        if (files.length > 0) {
            console.log(`[API] Processing ${files.length} files...`);

            for (const file of files) {
                try {
                    let processedBuffer = file.buffer;

                    // 2a. EXIF Cleanup for Images
                    if (file.mimetype.startsWith('image/')) {
                        console.log(`[API] Stripping EXIF metatada from ${file.originalname}`);
                        processedBuffer = await sharp(file.buffer)
                            .rotate() // Keep orientation but strip metadata
                            .toBuffer();
                    }

                    // 2b. Upload to IPFS
                    const cid = await uploadToPinata(processedBuffer, file.originalname);

                    // 2c. Encrypt the CID
                    const encryptedPath = encryptCID(cid);

                    // 2d. Store in evidence_files
                    await query(`
                        INSERT INTO evidence_files (report_id, file_name, file_type, file_size, encrypted_path)
                        VALUES ($1, $2, $3, $4, $5)
                    `, [id, file.originalname, file.mimetype, processedBuffer.length, encryptedPath]);

                } catch (uploadError) {
                    console.error(`Failed to process file ${file.originalname}:`, uploadError);
                }
            }
        }

        console.log(`✓ Report ${id} saved successfully`);

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
        id, is_anonymous, role, category, type, custom_crime_type, narrativa_real,
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

// Start server immediately to satisfy Render port scan
const server = app.listen(PORT, () => {
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`🚀 SIIEC Backend Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
    console.log(`💚 Health: http://localhost:${PORT}/api/health`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
});

const startServer = async () => {
    try {
        // Check database connection
        console.log('🔍 Checking database connection...');
        const dbHealthy = await checkDatabaseHealth();

        if (!dbHealthy) {
            console.error('❌ Database connection failed initially. Will retry in background...');
            // Do not exit, allow server to stay alive for debugging
        } else {
            // Setup database schema (creates tables if they don't exist)
            console.log('🔧 Setting up database schema...');
            await setupDatabase();
        }

        // Check decryption availability
        if (isDecryptionAvailable()) {
            console.log('✓ Decryption service available');
        } else {
            console.warn('⚠️ Decryption service unavailable - reports will be stored encrypted only');
        }

    } catch (error) {
        console.error('❌ Error during startup sequence:', error);
        // Do not exit
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
