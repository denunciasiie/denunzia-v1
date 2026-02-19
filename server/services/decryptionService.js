import crypto from 'crypto';
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

/**
 * Server-Side Decryption Service
 * Decrypts data encrypted with RSA-4096 + AES-256-GCM
 */

/**
 * Get RSA private key from environment variable or file
 */
const getPrivateKey = () => {
    // 1. Try to load from Environment Variable (for decentralization/security)
    const envKey = process.env.PRIVATE_KEY_PEM || process.env.PRIVATE_KEY;
    if (envKey) {
        return envKey.replace(/\\n/g, '\n');
    }

    // 2. Fallback to file system
    const keyPath = process.env.PRIVATE_KEY_PATH || path.join(__dirname, '../keys/private_key.pem');
    if (fs.existsSync(keyPath)) {
        return fs.readFileSync(keyPath, 'utf8');
    }

    console.warn('⚠️ Private key not found. Decryption will fail.');
    return null;
};

/**
 * Decrypt AES key using RSA private key
 */
const decryptAESKey = (encryptedKey) => {
    const privateKey = getPrivateKey();
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

    // SubtleCrypto AES-GCM appends 16 bytes of tag to the end.
    try {
        const tag = encryptedBuffer.slice(-16);
        const data = encryptedBuffer.slice(0, -16);
        decipher.setAuthTag(tag);
        let decrypted = decipher.update(data);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString('utf8');
    } catch (e) {
        // Fallback for non-GCM or if tag is handled differently
        return decipher.update(encryptedBuffer).toString('utf8');
    }
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

        if (!encryptedData || !encryptedKey || !iv) {
            throw new Error('Invalid encrypted payload structure');
        }

        const aesKey = decryptAESKey(encryptedKey);
        const decryptedText = decryptWithAES(encryptedData, aesKey, iv);
        const decryptedData = JSON.parse(decryptedText);

        return decryptedData;
    } catch (error) {
        console.error('❌ Decryption error:', error.message);
        throw new Error('Failed to decrypt data');
    }
};

export const validatePayloadSize = (payload) => {
    const maxSize = parseInt(process.env.MAX_PAYLOAD_SIZE) || 50 * 1024 * 1024;
    const payloadSize = Buffer.from(JSON.stringify(payload)).length;
    if (payloadSize > maxSize) {
        throw new Error(`Payload size exceeded`);
    }
    return true;
};

export const sanitizeDecryptedData = (data) => {
    if (!data) return data;
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
            sanitized[key] = value.replace(/[<>]/g, '').trim().slice(0, 10000);
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeDecryptedData(value);
        } else {
            sanitized[key] = value;
        }
    }
    return sanitized;
};

export const isDecryptionAvailable = () => {
    return !!getPrivateKey();
};
