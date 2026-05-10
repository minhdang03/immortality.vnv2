/**
 * expo-crypto stub for jest — provides random bytes via Node's crypto module.
 * Only getRandomBytes is needed by journal-crypto.ts.
 */
const { randomBytes } = require('crypto');

module.exports = {
  getRandomBytes: (size) => new Uint8Array(randomBytes(size)),
};
