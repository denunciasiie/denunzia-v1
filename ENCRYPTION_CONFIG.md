# Configuración de Cifrado Client-Side - RSA + AES

## 🔐 Generación de Claves RSA-4096

### Requisitos de Producción

Para implementar el cifrado de extremo a extremo en producción, necesitas generar un par de claves RSA-4096:

#### 1. Generar Par de Claves (Servidor)

```bash
# Generar clave privada RSA-4096
openssl genrsa -out private_key.pem 4096

# Extraer clave pública
openssl rsa -in private_key.pem -pubout -out public_key.pem

# Verificar la clave
openssl rsa -in private_key.pem -text -noout
```

#### 2. Proteger la Clave Privada

```bash
# Encriptar la clave privada con contraseña
openssl rsa -aes256 -in private_key.pem -out private_key_encrypted.pem

# Establecer permisos restrictivos
chmod 400 private_key_encrypted.pem
```

#### 3. Almacenamiento Seguro

**⚠️ CRÍTICO:**
- **NUNCA** almacenes la clave privada en el repositorio
- **NUNCA** la incluyas en el código fuente
- **NUNCA** la expongas en variables de entorno del cliente

**Opciones Seguras:**
1. **Hardware Security Module (HSM)** - Recomendado para producción
2. **AWS KMS / Azure Key Vault / Google Cloud KMS**
3. **HashiCorp Vault**
4. **Servidor seguro con acceso restringido**

---

## 📝 Actualizar Clave Pública en el Cliente

### Paso 1: Convertir PEM a formato compatible

La clave pública debe estar en formato PEM estándar:

```
-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA...
[Tu clave pública aquí]
...
-----END PUBLIC KEY-----
```

### Paso 2: Actualizar el código

Edita el archivo `services/encryptionService.ts`:

```typescript
// Línea 11 - Reemplaza el PLACEHOLDER con tu clave pública real
const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA...
[PEGA TU CLAVE PÚBLICA AQUÍ]
...
-----END PUBLIC KEY-----`;
```

---

## 🔓 Descifrado en el Servidor (Backend)

### Implementación Node.js

```javascript
const crypto = require('crypto');
const fs = require('fs');

// Cargar clave privada desde almacenamiento seguro
const privateKey = fs.readFileSync('path/to/private_key.pem', 'utf8');

function decryptData(encryptedPayload) {
  try {
    // 1. Descifrar la clave AES con RSA
    const encryptedKeyBuffer = Buffer.from(encryptedPayload.encryptedKey, 'base64');
    const aesKey = crypto.privateDecrypt(
      {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        oaepHash: 'sha256',
      },
      encryptedKeyBuffer
    );

    // 2. Descifrar los datos con AES-256-GCM
    const encryptedData = Buffer.from(encryptedPayload.encryptedData, 'base64');
    const iv = Buffer.from(encryptedPayload.iv, 'base64');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', aesKey, iv);
    
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    // 3. Parsear JSON
    const plaintext = decrypted.toString('utf8');
    return JSON.parse(plaintext);
    
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

// Uso
app.post('/api/reports', (req, res) => {
  const { encryptedData, encryptedKey, iv } = req.body;
  
  const decryptedData = decryptData({ encryptedData, encryptedKey, iv });
  
  // Ahora tienes acceso a:
  // - decryptedData.narrative
  // - decryptedData.entities
  // - decryptedData.addressDetails
  // - decryptedData.customCrimeType
  
  // Guardar en base de datos...
});
```

### Implementación Python

```python
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import base64
import json

def decrypt_data(encrypted_payload):
    # Cargar clave privada
    with open('private_key.pem', 'rb') as key_file:
        private_key = serialization.load_pem_private_key(
            key_file.read(),
            password=None,
            backend=default_backend()
        )
    
    # 1. Descifrar clave AES con RSA
    encrypted_key = base64.b64decode(encrypted_payload['encryptedKey'])
    aes_key = private_key.decrypt(
        encrypted_key,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    
    # 2. Descifrar datos con AES-256-GCM
    encrypted_data = base64.b64decode(encrypted_payload['encryptedData'])
    iv = base64.b64decode(encrypted_payload['iv'])
    
    cipher = Cipher(
        algorithms.AES(aes_key),
        modes.GCM(iv),
        backend=default_backend()
    )
    decryptor = cipher.decryptor()
    
    plaintext = decryptor.update(encrypted_data) + decryptor.finalize()
    
    # 3. Parsear JSON
    return json.loads(plaintext.decode('utf-8'))
```

---

## 🧪 Testing

### Prueba de Cifrado/Descifrado

```javascript
// test/encryption.test.js
const { encryptData } = require('../services/encryptionService');
const { decryptData } = require('../server/decryptionService');

test('Encrypt and decrypt data successfully', async () => {
  const originalData = {
    narrative: "Test narrative",
    entities: "Test entities",
    addressDetails: { street: "Test St" },
  };
  
  const encrypted = await encryptData(JSON.stringify(originalData));
  const decrypted = decryptData(encrypted);
  
  expect(decrypted).toEqual(originalData);
});
```

---

## 📊 Payload Structure

### Cliente → Servidor

```json
{
  "encryptedData": "base64_encoded_aes_encrypted_data",
  "encryptedKey": "base64_encoded_rsa_encrypted_aes_key",
  "iv": "base64_encoded_initialization_vector",
  "algorithm": "RSA-OAEP-4096 + AES-256-GCM",
  "timestamp": "2026-01-28T12:00:00.000Z"
}
```

### Datos Descifrados

```json
{
  "narrative": "Descripción detallada del incidente...",
  "entities": "Nombres de personas, empresas, etc.",
  "addressDetails": {
    "street": "Calle Principal 123",
    "colony": "Centro",
    "zipCode": "12345",
    "references": "Cerca del parque"
  },
  "customCrimeType": "Fraude en criptomonedas"
}
```

---

## 🔒 Mejores Prácticas de Seguridad

### 1. Rotación de Claves

```bash
# Generar nuevas claves cada 90 días
0 0 1 */3 * /path/to/rotate_keys.sh
```

### 2. Auditoría

```javascript
// Log de operaciones de descifrado (sin datos sensibles)
logger.info({
  event: 'decryption_attempt',
  timestamp: new Date().toISOString(),
  success: true,
  algorithm: 'RSA-4096+AES-256-GCM',
  // NO registrar datos descifrados
});
```

### 3. Rate Limiting

```javascript
// Limitar intentos de descifrado
const rateLimit = require('express-rate-limit');

const decryptLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests
  message: 'Too many decryption attempts'
});

app.post('/api/reports', decryptLimiter, handleReport);
```

### 4. Validación de Payload

```javascript
function validateEncryptedPayload(payload) {
  if (!payload.encryptedData || !payload.encryptedKey || !payload.iv) {
    throw new Error('Invalid encrypted payload structure');
  }
  
  // Verificar tamaño máximo (prevenir DoS)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (Buffer.from(payload.encryptedData, 'base64').length > maxSize) {
    throw new Error('Encrypted payload too large');
  }
  
  return true;
}
```

---

## 📋 Checklist de Implementación

- [ ] Generar par de claves RSA-4096
- [ ] Almacenar clave privada en sistema seguro (HSM/KMS)
- [ ] Actualizar clave pública en `encryptionService.ts`
- [ ] Implementar endpoint de descifrado en backend
- [ ] Configurar rate limiting
- [ ] Implementar logging de auditoría
- [ ] Configurar rotación de claves
- [ ] Realizar pruebas de cifrado/descifrado
- [ ] Documentar procedimientos de emergencia
- [ ] Configurar alertas de seguridad

---

## 🆘 Procedimientos de Emergencia

### Si la clave privada se compromete:

1. **Inmediato:** Revocar clave comprometida
2. Generar nuevo par de claves
3. Actualizar clave pública en cliente
4. Desplegar nueva versión
5. Notificar a usuarios (si aplica)
6. Auditar logs de acceso
7. Investigar causa de compromiso

---

**Última actualización:** 2026-01-28  
**Versión:** 1.0  
**Mantenedor:** Equipo de Seguridad SIIEC
