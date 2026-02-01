import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔐 Generando par de claves RSA-4096...\n');

// Generar par de claves RSA-4096
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});

// Crear directorio keys si no existe
const keysDir = path.join(__dirname, 'keys');
if (!fs.existsSync(keysDir)) {
    fs.mkdirSync(keysDir, { recursive: true });
}

// Guardar clave privada
const privateKeyPath = path.join(keysDir, 'private_key.pem');
fs.writeFileSync(privateKeyPath, privateKey);
console.log('✓ Clave privada guardada en:', privateKeyPath);

// Guardar clave pública
const publicKeyPath = path.join(keysDir, 'public_key.pem');
fs.writeFileSync(publicKeyPath, publicKey);
console.log('✓ Clave pública guardada en:', publicKeyPath);

console.log('\n📋 IMPORTANTE: Copia la siguiente clave pública al archivo services/encryptionService.ts\n');
console.log('═'.repeat(80));
console.log(publicKey);
console.log('═'.repeat(80));

console.log('\n✅ Claves RSA-4096 generadas exitosamente!');
console.log('⚠️  NUNCA compartas la clave privada (private_key.pem)');
