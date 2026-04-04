// lib/crypto.ts

// Ensure crypto is available in both browser & Node (Next.js)
import { webcrypto } from "crypto";

const runtimeCrypto: Crypto =
  (globalThis.crypto as Crypto | undefined) ?? (webcrypto as unknown as Crypto);

const ALGO = "AES-GCM";
const IV_LENGTH = 12; // 96 bits (recommended)
const PBKDF2_ITERATIONS = 100_000;
const PBKDF2_HASH = "SHA-256";

// ---------- Utils ----------

function toArrayBuffer(buffer: ArrayBufferLike): ArrayBuffer {
  if (buffer instanceof ArrayBuffer) {
    return buffer;
  }

  return new Uint8Array(buffer).slice().buffer;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  if (typeof btoa === "function") {
    return btoa(binary);
  }

  return Buffer.from(bytes).toString("base64");
}

function base64ToBytes(base64: string): Uint8Array {
  if (typeof atob === "function") {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
  }

  return new Uint8Array(Buffer.from(base64, "base64"));
}

function bufferToBase64(buffer: ArrayBuffer): string {
  return bytesToBase64(new Uint8Array(buffer));
}

function base64ToBuffer(base64: string): ArrayBuffer {
  return toArrayBuffer(base64ToBytes(base64).buffer);
}

function textToBuffer(text: string): ArrayBuffer {
  return toArrayBuffer(new TextEncoder().encode(text).buffer);
}

function bufferToText(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer);
}

function xorBuffers(a: ArrayBuffer, b: ArrayBuffer): ArrayBuffer {
  const aBytes = new Uint8Array(a);
  const bBytes = new Uint8Array(b);

  if (aBytes.length !== bBytes.length) {
    throw new Error("XOR buffers must be same length");
  }

  const result = new Uint8Array(aBytes.length);
  for (let i = 0; i < aBytes.length; i++) {
    result[i] = aBytes[i] ^ bBytes[i];
  }

  return result.buffer;
}

// ---------- AES Key ----------

export async function generateKey(): Promise<CryptoKey> {
  return runtimeCrypto.subtle.generateKey(
    {
      name: ALGO,
      length: 256,
    },
    true, // extractable
    ["encrypt", "decrypt"]
  );
}

// ---------- Encrypt ----------

export async function encrypt(
  plaintext: string,
  key: CryptoKey
): Promise<{ ciphertext: string; iv: string }> {
  const iv = runtimeCrypto.getRandomValues(new Uint8Array(IV_LENGTH));

  const encoded = textToBuffer(plaintext);

  const encrypted = await runtimeCrypto.subtle.encrypt(
    {
      name: ALGO,
      iv,
    },
    key,
    encoded
  );

  return {
    ciphertext: bufferToBase64(encrypted),
    iv: bufferToBase64(toArrayBuffer(iv.buffer)),
  };
}

// ---------- Decrypt ----------

export async function decrypt(
  ciphertext: string,
  iv: string,
  key: CryptoKey
): Promise<string> {
  try {
    const decrypted = await runtimeCrypto.subtle.decrypt(
      {
        name: ALGO,
        iv: new Uint8Array(base64ToBuffer(iv)),
      },
      key,
      base64ToBuffer(ciphertext)
    );

    return bufferToText(decrypted);
  } catch {
    throw new Error("Decryption failed (wrong key or corrupted data)");
  }
}

// ---------- Key Export / Import ----------

export async function exportKey(key: CryptoKey): Promise<string> {
  const raw = await runtimeCrypto.subtle.exportKey("raw", key);
  return bufferToBase64(raw);
}

export async function importKey(base64Key: string): Promise<CryptoKey> {
  const raw = base64ToBuffer(base64Key);

  return runtimeCrypto.subtle.importKey(
    "raw",
    raw,
    {
      name: ALGO,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

// ---------- PBKDF2 (Password → Key) ----------

export async function deriveKeyFromPassword(
  password: string,
  salt: string
): Promise<ArrayBuffer> {
  const passwordKey = await runtimeCrypto.subtle.importKey(
    "raw",
    textToBuffer(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  const derivedBits = await runtimeCrypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: textToBuffer(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: PBKDF2_HASH,
    },
    passwordKey,
    256 // bits
  );

  return derivedBits; // ArrayBuffer
}

// ---------- XOR Key Layer ----------

export async function applyPasswordLayer(
  baseKey: CryptoKey,
  password: string,
  salt: string
): Promise<CryptoKey> {
  const rawBaseKey = await runtimeCrypto.subtle.exportKey("raw", baseKey);
  const passwordBits = await deriveKeyFromPassword(password, salt);

  const finalKeyBuffer = xorBuffers(rawBaseKey, passwordBits);

  return runtimeCrypto.subtle.importKey(
    "raw",
    finalKeyBuffer,
    { name: ALGO },
    true,
    ["encrypt", "decrypt"]
  );
}

// ---------- Helpers ----------

export function generateSalt(length = 16): string {
  const salt = runtimeCrypto.getRandomValues(new Uint8Array(length));
  return bufferToBase64(toArrayBuffer(salt.buffer));
}