
/**
 * Simulates End-to-End Encryption (E2EE) logic.
 * In a real implementation, this would use Web Crypto API with public key cryptography.
 */

export const generateSessionKeys = async (): Promise<string> => {
  // Simulate key generation delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return "session_key_" + Math.random().toString(36).substring(7);
};

export const encryptData = async <T,>(data: T, key: string): Promise<string> => {
  // Simulate encryption process
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log(`[Crypto] Encrypting data with key: ${key}`);
  
  try {
    // Safe mock encryption that handles Unicode (Spanish accents) and circular refs
    // Note: btoa fails on unicode strings without encoding first
    const jsonString = JSON.stringify(data, (key, value) => {
      // filter out File objects for JSON stringify as they become empty objects
      if (value instanceof File) {
        return { name: value.name, size: value.size, type: value.type };
      }
      return value;
    });
    
    // Unicode-safe base64 encoding mock
    const encoded = btoa(unescape(encodeURIComponent(jsonString)));
    return `ENC[${key.substring(0,5)}]${encoded.substring(0, 20)}...`; 
  } catch (e) {
    console.warn("Encryption mock fallback", e);
    return "ENCRYPTED_DATA_HASH_" + Math.random().toString(16);
  }
};

export const encryptFile = async (file: File, key: string): Promise<Blob> => {
  // Simulate file encryption
  console.log(`[Crypto] Encrypting file: ${file.name}`);
  return file.slice(0, file.size, file.type); // Return same blob for demo, normally would be encrypted blob
};

export const checkTorConnection = (): boolean => {
  // In a real web app, detecting Tor is difficult (by design) without checking IP against exit nodes server-side.
  // This mocks a check based on user agent or specific browser APIs often disabled in Tor.
  // For this demo, we assume false unless 'tor' is in the query string for testing.
  const isTor = window.location.hash.includes('tor=true') || navigator.userAgent.includes('Tor');
  return isTor;
};
