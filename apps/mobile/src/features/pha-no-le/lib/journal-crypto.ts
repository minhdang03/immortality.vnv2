/**
 * journal-crypto — AES-GCM client-side encryption for Phá Nô Lệ practice logs.
 *
 * Security model:
 *  - AES-GCM 256-bit key generated once per device on first use.
 *  - Key stored in expo-secure-store (Keychain on iOS, Keystore on Android).
 *  - Server stores only { ciphertext (base64), iv (base64) } — never the key.
 *  - IV is randomly generated per encryption; unique per entry.
 *
 * Key loss:
 *  - App reinstall without key backup = permanent loss of local-encrypted entries.
 *  - UI must warn user before first entry (see ChuNoLogScreen reinstall warning).
 */
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const SECURE_STORE_KEY = 'btd_pha_no_le_aes_key';

// ── Types ──────────────────────────────────────────────────────────────────

export interface EncryptedPayload {
  ciphertext: string; // base64-encoded
  iv: string;         // base64-encoded, 12 bytes
}

// ── Key management ─────────────────────────────────────────────────────────

async function getOrCreateKey(): Promise<CryptoKey> {
  const storedJwk = await SecureStore.getItemAsync(SECURE_STORE_KEY);

  if (!storedJwk) {
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true, // extractable for JWK export + storage
      ['encrypt', 'decrypt'],
    );
    const jwk = await crypto.subtle.exportKey('jwk', key);
    await SecureStore.setItemAsync(SECURE_STORE_KEY, JSON.stringify(jwk));
    return key;
  }

  const jwk = JSON.parse(storedJwk) as JsonWebKey;
  return crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'AES-GCM', length: 256 },
    false, // non-extractable after import
    ['encrypt', 'decrypt'],
  );
}

// Test override — lets tests inject a key without expo-secure-store
let _keyOverride: CryptoKey | null = null;

export function _setKeyOverrideForTest(key: CryptoKey | null) {
  _keyOverride = key;
}

async function getKey(): Promise<CryptoKey> {
  if (_keyOverride) return _keyOverride;
  return getOrCreateKey();
}

// ── Helpers ────────────────────────────────────────────────────────────────

function bufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuffer(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ── encrypt ────────────────────────────────────────────────────────────────

export async function encryptEntry(plaintext: string): Promise<EncryptedPayload> {
  const key = await getKey();
  // 12-byte IV — standard for AES-GCM, unique per entry
  const ivBytes = Crypto.getRandomBytes(12);
  const iv = bufferToBase64(ivBytes.buffer as ArrayBuffer);

  const encoded = new TextEncoder().encode(plaintext);
  const ciphertextBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: ivBytes },
    key,
    encoded,
  );

  return { ciphertext: bufferToBase64(ciphertextBuf), iv };
}

// ── decrypt ────────────────────────────────────────────────────────────────

/** Throws if key doesn't match (e.g. after reinstall). */
export async function decryptEntry({ ciphertext, iv }: EncryptedPayload): Promise<string> {
  const key = await getKey();
  const ivBuf = base64ToBuffer(iv);
  const ciphertextBuf = base64ToBuffer(ciphertext);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBuf },
    key,
    ciphertextBuf,
  );

  return new TextDecoder().decode(decrypted);
}

// ── hasEncryptionKey ───────────────────────────────────────────────────────

/** Returns true if a key is already stored (user has created at least one entry). */
export async function hasEncryptionKey(): Promise<boolean> {
  if (_keyOverride) return true;
  const stored = await SecureStore.getItemAsync(SECURE_STORE_KEY);
  return stored !== null;
}
