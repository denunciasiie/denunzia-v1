/**
 * Client-Side Encryption Module
 * RSA-4096 + AES-256-GCM Hybrid Encryption
 * 
 * Security Features:
 * - RSA-4096 for key exchange
 * - AES-256-GCM for data encryption
 * - Random IV generation
 * - No private keys stored client-side
 */

// PLACEHOLDER: Replace with actual RSA-4096 public key from secure key management system
const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAlCH629sqTFV6zfEMvpxC
kb8CYZ50biV/ym33qale8Hff1gwEGUdO3j96ydDsjYkwFpXgqa2VgYbQ5+UXXKGS
f214rjzjrr29ZcM7T063G77DZdSPHr9vYOmYJITYnkel7nElTqqdVSp1nvIwmxxi
r4TleNc2xHjKeV/gy6+mUPhC+gPtxUwmnT+oRKKzWPcUPco2qMq0/GZiMg/d0OhO
c2ELQ/kS+fQNxWgQPT1pVPrKyeJbaXo7qv6QbKn6zY1R3AnTh6QogwOsMHVz6Qvh
wNHWoO5i2l7/+Nqt1Q82LluTWv1H5TKtrACK1/2cGIDSWyDxziWOfCCTu8oTts80
/Swal9l/9G5QEo2g2x4lSTFI+fZAc2GTaITPeF1L6DOLeg7PUbksnZvpZkESS72I
uT/YBa5g1lId7Vq7Y2bXL1iBaHEuWIR5+wI6vh4AazArY/jR7Ghc45Ag2zxeVct9
fOd7cJ7JcynawURV91ZXlja1gMUE7Mp9TvrU+LJJ/VK+RHy+yz6Q5zvgWHvM7LY8
ZMYdkhCsGJW+oaXj98D7SPasg8RQEOvNweIpAC1eBpPByvsAk8cdbBGO6NZqTz5i
cl93VjM0cHPEoEIbVA8i6NUn5pGd2uFn8qYlOV0C4TMU2CEOOb57HOcSoFFjc86K
w66AcVBlw90hKQ5lH0uDR/0CAwEAAQ==
-----END PUBLIC KEY-----`;

/**
 * Converts a PEM formatted public key to CryptoKey object
 */
async function importPublicKey(pemKey: string): Promise<CryptoKey> {
    // Remove PEM header/footer and decode base64
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    const pemContents = pemKey
        .replace(pemHeader, "")
        .replace(pemFooter, "")
        .replace(/\s/g, "");

    // For demo purposes, generate a temporary RSA key pair
    // In production, import the actual public key
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 4096,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true,
        ["encrypt", "decrypt"]
    );

    return keyPair.publicKey;
}

/**
 * Generates a random AES-256 key
 */
async function generateAESKey(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256,
        },
        true,
        ["encrypt", "decrypt"]
    );
}

/**
 * Encrypts data using AES-256-GCM
 */
async function encryptWithAES(
    data: string,
    key: CryptoKey
): Promise<{ ciphertext: ArrayBuffer; iv: Uint8Array }> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);

    // Generate random IV (12 bytes for GCM)
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const ciphertext = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv,
        },
        key,
        dataBuffer
    );

    return { ciphertext, iv };
}

/**
 * Encrypts AES key using RSA-OAEP
 */
async function encryptAESKeyWithRSA(
    aesKey: CryptoKey,
    publicKey: CryptoKey
): Promise<ArrayBuffer> {
    const exportedKey = await window.crypto.subtle.exportKey("raw", aesKey);

    return await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP",
        },
        publicKey,
        exportedKey
    );
}

/**
 * Converts ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

/**
 * Main encryption function - Hybrid RSA + AES encryption
 * 
 * @param plaintext - The data to encrypt
 * @returns Encrypted payload with metadata
 */
export async function encryptData(plaintext: string): Promise<{
    encryptedData: string;
    encryptedKey: string;
    iv: string;
    algorithm: string;
    timestamp: string;
}> {
    try {
        // Validate input
        if (!plaintext || plaintext.trim().length === 0) {
            throw new Error("Cannot encrypt empty data");
        }

        // Limit size to prevent memory overflow (max 1MB)
        const maxSize = 1024 * 1024; // 1MB
        if (new Blob([plaintext]).size > maxSize) {
            throw new Error("Data size exceeds maximum allowed (1MB)");
        }

        // Step 1: Import RSA public key
        const publicKey = await importPublicKey(PUBLIC_KEY_PEM);

        // Step 2: Generate random AES-256 key
        const aesKey = await generateAESKey();

        // Step 3: Encrypt data with AES-256-GCM
        const { ciphertext, iv } = await encryptWithAES(plaintext, aesKey);

        // Step 4: Encrypt AES key with RSA-4096
        const encryptedAESKey = await encryptAESKeyWithRSA(aesKey, publicKey);

        // Step 5: Convert to Base64 for transmission
        const encryptedDataB64 = arrayBufferToBase64(ciphertext);
        const encryptedKeyB64 = arrayBufferToBase64(encryptedAESKey);
        // Convert Uint8Array to base64 directly
        let ivBinary = '';
        for (let i = 0; i < iv.byteLength; i++) {
            ivBinary += String.fromCharCode(iv[i]);
        }
        const ivB64 = btoa(ivBinary);


        return {
            encryptedData: encryptedDataB64,
            encryptedKey: encryptedKeyB64,
            iv: ivB64,
            algorithm: "RSA-OAEP-4096 + AES-256-GCM",
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.error("Encryption error:", error);
        throw new Error("Failed to encrypt data. Please try again.");
    }
}

/**
 * Clears the system clipboard for security
 */
export async function clearClipboard(): Promise<void> {
    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText("");
            console.log("Clipboard cleared successfully");
        }
    } catch (error) {
        console.warn("Could not clear clipboard:", error);
        // Fallback: try to overwrite with random data
        try {
            const randomData = Array.from(
                window.crypto.getRandomValues(new Uint8Array(32))
            )
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("");
            await navigator.clipboard.writeText(randomData);
            setTimeout(async () => {
                await navigator.clipboard.writeText("");
            }, 100);
        } catch (fallbackError) {
            console.warn("Clipboard clearing fallback failed:", fallbackError);
        }
    }
}

/**
 * Sanitizes input to prevent XSS and injection attacks
 */
export function sanitizeInput(input: string): string {
    return input
        .replace(/[<>]/g, "") // Remove angle brackets
        .trim()
        .slice(0, 10000); // Hard limit
}

/**
 * Validates that required fields are not empty
 */
export function validateFormData(data: Record<string, any>): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Check for empty required fields
    Object.entries(data).forEach(([key, value]) => {
        if (typeof value === "string" && value.trim().length === 0) {
            errors.push(`El campo ${key} no puede estar vacío`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Generates encryption status message for UI
 */
export function getEncryptionStatus(stage: 'idle' | 'encrypting' | 'complete' | 'error'): {
    icon: string;
    message: string;
    color: string;
} {
    const statuses = {
        idle: {
            icon: "🔒",
            message: "Tus datos serán cifrados localmente antes de enviarse",
            color: "#8b5cf6",
        },
        encrypting: {
            icon: "⚡",
            message: "Cifrando datos con RSA-4096 + AES-256...",
            color: "#d946ef",
        },
        complete: {
            icon: "✓",
            message: "Datos cifrados exitosamente",
            color: "#10b981",
        },
        error: {
            icon: "⚠️",
            message: "Error en el cifrado. Intenta nuevamente",
            color: "#ef4444",
        },
    };

    return statuses[stage];
}
