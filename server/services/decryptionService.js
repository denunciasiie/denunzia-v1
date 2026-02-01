import crypto from 'crypto';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Server-Side Decryption Service
 * Decrypts data encrypted with RSA-4096 + AES-256-GCM
 */

/**
 * Load RSA private key from file
 */
const loadPrivateKey = () => {
    try {
        const keyPath = process.env.PRIVATE_KEY_PATH || './keys/private_key.pem';

        if (!fs.existsSync(keyPath)) {
            console.warn('⚠️ Private key not found. Decryption will fail.');
            console.warn('Generate keys with: openssl genrsa -out private_key.pem 4096');
            return null;
        }

        const privateKey = fs.readFileSync(keyPath, 'utf8');
        return privateKey;
    } catch (error) {
        console.error('Error loading private key:', error);
        return null;
    }
};

const privateKey = loadPrivateKey();

/**
 * Decrypt AES key using RSA private key
 */
const decryptAESKey = (encryptedKey) => {
    if (!privateKey) {
        throw new Error('Private key not loaded');
    }

    const encryptedKeyBuffer = Buffer.from(encryptedKey, 'base64');

    const aesKey = crypto.privateDecrypt(
        {
            key: privateKey,
            padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
            oaepHash: 'sha256',
        },
        encryptedKeyBuffer
    );

    return aesKey;
};

/**
 * Decrypt data using AES-256-GCM
 */
const decryptWithAES = (encryptedData, aesKey, iv) => {
    const encryptedBuffer = Buffer.from(encryptedData, 'base64');
    const ivBuffer = Buffer.from(iv, 'base64');

    const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, ivBuffer);

    let decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
};

/**
 * Main decryption function
 * 
 * @param {Object} encryptedPayload - Encrypted data from client
 * @returns {Object} Decrypted data
 */
export const decryptData = (encryptedPayload) => {
    try {
        const { encryptedData, encryptedKey, iv, algorithm } = encryptedPayload;

        // Validate payload
        if (!encryptedData || !encryptedKey || !iv) {
            throw new Error('Invalid encrypted payload structure');
        }

        // Validate algorithm
        if (algorithm && !algorithm.includes('RSA-OAEP') && !algorithm.includes('AES-256-GCM')) {
            throw new Error('Unsupported encryption algorithm');
        }

        // Step 1: Decrypt AES key with RSA
        const aesKey = decryptAESKey(encryptedKey);

        // Step 2: Decrypt data with AES
        const decryptedText = decryptWithAES(encryptedData, aesKey, iv);

        // Step 3: Parse JSON
        const decryptedData = JSON.parse(decryptedText);

        console.log('✓ Data decrypted successfully');

        return decryptedData;
    } catch (error) {
        console.error('❌ Decryption error:', error.message);
        throw new Error('Failed to decrypt data');
    }
};

/**
 * Validate encrypted payload size
 */
export const validatePayloadSize = (payload) => {
    const maxSize = parseInt(process.env.MAX_PAYLOAD_SIZE) || 2 * 1024 * 1024; // 2MB default

    const payloadSize = Buffer.from(JSON.stringify(payload)).length;

    if (payloadSize > maxSize) {
        throw new Error(`Payload size (${payloadSize} bytes) exceeds maximum allowed (${maxSize} bytes)`);
    }

    return true;
};

/**
 * Sanitize decrypted data
 */
export const sanitizeDecryptedData = (data) => {
    const sanitized = {};

    // Remove any potential XSS or injection attempts
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
            sanitized[key] = value
                .replace(/[<>]/g, '') // Remove angle brackets
                .trim()
                .slice(0, 10000); // Hard limit
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeDecryptedData(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
};

/**
 * Check if decryption is available
 */
export const isDecryptionAvailable = () => {
    return privateKey !== null;
};
