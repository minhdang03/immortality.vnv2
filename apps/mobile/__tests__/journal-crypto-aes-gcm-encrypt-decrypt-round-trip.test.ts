/**
 * Tests: AES-GCM encrypt → decrypt round-trip for journal-crypto.ts
 *
 * Uses a stable in-memory CryptoKey override (_setKeyOverrideForTest)
 * so expo-secure-store is never called in tests.
 *
 * Covers:
 *  - encrypt then decrypt returns original plaintext
 *  - ciphertext is different from plaintext (not identity encoding)
 *  - two encryptions of same plaintext produce different IVs (non-deterministic)
 *  - decrypt with wrong key throws (simulates reinstall scenario)
 *  - hasEncryptionKey returns true when key override set
 */

// Mock expo-secure-store — not needed when using key override
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// expo-crypto is mapped to src/__mocks__/expo-crypto-random-bytes-stub.js via jest.config.js moduleNameMapper
// No jest.mock() needed here — the stub provides getRandomBytes via Node crypto

import {
  encryptEntry,
  decryptEntry,
  hasEncryptionKey,
  _setKeyOverrideForTest,
} from '../src/features/pha-no-le/lib/journal-crypto';

// ── Helpers ────────────────────────────────────────────────────────────────

async function generateTestKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ]);
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('journal-crypto AES-GCM round-trip', () => {
  let testKey: CryptoKey;

  beforeAll(async () => {
    testKey = await generateTestKey();
    _setKeyOverrideForTest(testKey);
  });

  afterAll(() => {
    _setKeyOverrideForTest(null);
  });

  it('encrypt then decrypt returns original plaintext', async () => {
    const original = 'Hôm nay phát hiện chủ nô giấu mặt trong self-help industry.';
    const encrypted = await encryptEntry(original);
    const decrypted = await decryptEntry(encrypted);
    expect(decrypted).toBe(original);
  });

  it('handles Vietnamese multi-byte characters correctly', async () => {
    const original = 'Thiếu hiểu biết · Ông bà lạc hậu · Định kiến · Chủ nô giấu mặt 🔒';
    const encrypted = await encryptEntry(original);
    const decrypted = await decryptEntry(encrypted);
    expect(decrypted).toBe(original);
  });

  it('handles empty string', async () => {
    const encrypted = await encryptEntry('');
    const decrypted = await decryptEntry(encrypted);
    expect(decrypted).toBe('');
  });

  it('handles long entry (2000 chars)', async () => {
    const original = 'Phá nô lệ trí tuệ. '.repeat(100);
    const encrypted = await encryptEntry(original);
    const decrypted = await decryptEntry(encrypted);
    expect(decrypted).toBe(original);
  });

  it('ciphertext is base64 and different from plaintext', async () => {
    const plaintext = 'Không ai xài não tôi ngoài tôi.';
    const { ciphertext, iv } = await encryptEntry(plaintext);

    // Both are valid base64
    expect(() => atob(ciphertext)).not.toThrow();
    expect(() => atob(iv)).not.toThrow();

    // Ciphertext is not the plaintext encoded
    expect(ciphertext).not.toBe(btoa(plaintext));
  });

  it('iv is 12 bytes (base64 length = 16 chars for 12 bytes)', async () => {
    const { iv } = await encryptEntry('test');
    const decoded = atob(iv);
    expect(decoded.length).toBe(12);
  });

  it('two encryptions of same plaintext produce different IVs', async () => {
    const plaintext = 'Mỗi ngày phá thêm 1 mảnh.';
    const enc1 = await encryptEntry(plaintext);
    const enc2 = await encryptEntry(plaintext);
    expect(enc1.iv).not.toBe(enc2.iv);
    expect(enc1.ciphertext).not.toBe(enc2.ciphertext);
  });

  it('decrypt with tampered ciphertext throws', async () => {
    const { ciphertext, iv } = await encryptEntry('sensitive note');
    // Corrupt one byte in ciphertext
    const tampered = ciphertext.slice(0, -4) + 'XXXX';
    await expect(decryptEntry({ ciphertext: tampered, iv })).rejects.toThrow();
  });

  it('decrypt with wrong key throws (simulates reinstall key mismatch)', async () => {
    const wrongKey = await generateTestKey();

    // Encrypt with testKey
    const encrypted = await encryptEntry('Ngày 1: phá quan niệm cũ.');

    // Switch to wrong key for decrypt
    _setKeyOverrideForTest(wrongKey);
    await expect(decryptEntry(encrypted)).rejects.toThrow();

    // Restore test key
    _setKeyOverrideForTest(testKey);
  });

  it('hasEncryptionKey returns true when override is set', async () => {
    _setKeyOverrideForTest(testKey);
    const result = await hasEncryptionKey();
    expect(result).toBe(true);
  });

  it('hasEncryptionKey returns false when override cleared and no stored key', async () => {
    _setKeyOverrideForTest(null);
    // expo-secure-store mock returns null → no stored key
    const result = await hasEncryptionKey();
    expect(result).toBe(false);
    // Restore
    _setKeyOverrideForTest(testKey);
  });
});
