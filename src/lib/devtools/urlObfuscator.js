// lib/urlObfuscator.js - MEDIUM LEVEL SECURITY
// XOR Encryption + Hex Encoding + Multi-Base64

/**
 * Generate a random key for XOR encryption
 */
function generateKey() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let key = "";
  for (let i = 0; i < 16; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

/**
 * XOR encryption/decryption
 */
function xorCrypt(text, key) {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(
      text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
    );
  }
  return result;
}

/**
 * Convert string to hex
 */
function toHex(str) {
  let hex = "";
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16).padStart(2, "0");
  }
  return hex;
}

/**
 * Convert hex to string
 */
function fromHex(hex) {
  let str = "";
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }
  return str;
}

/**
 * Obfuscate URL - MEDIUM SECURITY
 * Process:
 * 1. Add random salt and timestamp
 * 2. XOR encrypt with random key
 * 3. Convert to hex
 * 4. Hide key in the middle of hex string
 * 5. Triple Base64 encode
 */
export function obfuscateUrl(url) {
  if (!url) return null;

  try {
    // Step 1: Generate random key
    const key = generateKey();

    // Step 2: Add timestamp and random salt for uniqueness
    const timestamp = Date.now().toString(36);
    const salt = Math.random().toString(36).substring(2, 10);
    const payload = `${salt}|${timestamp}|${url}`;

    // Step 3: XOR encrypt the payload
    const encrypted = xorCrypt(payload, key);

    // Step 4: Convert encrypted data to hex
    const hex = toHex(encrypted);

    // Step 5: Hide the key in the middle of the hex string
    const mid = Math.floor(hex.length / 2);
    const withKey = hex.slice(0, mid) + toHex(key) + hex.slice(mid);

    // Step 6: Triple Base64 encode for extra obfuscation
    let result = btoa(withKey);
    result = btoa(result);
    result = btoa(result);

    return result;
  } catch (error) {
    console.error("❌ Obfuscation error:", error);
    return null;
  }
}

/**
 * Deobfuscate URL - MEDIUM SECURITY
 * Reverse process of obfuscation
 */
export function deobfuscateUrl(encoded) {
  if (!encoded) return null;

  try {
    // Step 1: Triple Base64 decode
    let decoded = atob(encoded);
    decoded = atob(decoded);
    decoded = atob(decoded);

    // Step 2: Extract key from middle
    // Key is always 32 hex characters (16 bytes * 2)
    const keyHexLength = 32;
    const mid = Math.floor((decoded.length - keyHexLength) / 2);
    const keyHex = decoded.slice(mid, mid + keyHexLength);
    const contentHex =
      decoded.slice(0, mid) + decoded.slice(mid + keyHexLength);

    // Step 3: Convert from hex back to strings
    const key = fromHex(keyHex);
    const encrypted = fromHex(contentHex);

    // Step 4: XOR decrypt
    const decrypted = xorCrypt(encrypted, key);

    // Step 5: Extract URL from payload (format: salt|timestamp|url)
    const parts = decrypted.split("|");
    if (parts.length >= 3) {
      // Join remaining parts in case URL contains |
      return parts.slice(2).join("|");
    }

    return null;
  } catch (error) {
    console.error("❌ Deobfuscation error:", error);
    return null;
  }
}

// Legacy exports for backwards compatibility (not used, but kept for safety)
export function obfuscateUrlAdvanced(url) {
  return obfuscateUrl(url);
}

export function deobfuscateUrlAdvanced(encoded) {
  return deobfuscateUrl(encoded);
}
