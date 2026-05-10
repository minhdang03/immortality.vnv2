/** @type {import('jest').Config} */
// Use jest-expo as preset string (not spread) so setupFiles, transform, etc. are all inherited correctly
module.exports = {
  preset: 'jest-expo',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  // pnpm stores packages in a virtual store: node_modules/.pnpm/<pkg>/node_modules/<pkg>
  // Must allow transformation for react-native and all expo/RN ecosystem packages
  transformIgnorePatterns: [
    'node_modules/(?!\\.pnpm|' +
      '(jest-)?react-native' +
      '|@react-native(-community)?' +
      '|@react-native/js-polyfills' +
      '|expo(nent)?' +
      '|@expo(nent)?/.*' +
      '|@expo-google-fonts/.*' +
      '|react-navigation' +
      '|@react-navigation/.*' +
      '|@testing-library/.*' +
      '|@btd/.*' +
      '|@unimodules/.*' +
      '|unimodules' +
      '|native-base' +
      '|react-native-svg' +
      '|react-native-reanimated' +
      '|react-native-screens' +
      '|react-native-safe-area-context' +
      '|react-native-webview' +
      '|react-native-track-player' +
      '|@shopify/.*' +
      '|zustand' +
      '|@tanstack/.*' +
      '|partysocket' +
      ')',
  ],
  moduleNameMapper: {
    '^@btd/ui-tokens$': '<rootDir>/../../packages/ui-tokens/src/index.ts',
    '^@btd/shared$': '<rootDir>/../../packages/shared/src/index.ts',
    '^@btd/firebase-config$': '<rootDir>/../../packages/firebase-config/src/index.ts',
    // react-native-track-player requires native build; stub for jest
    '^react-native-track-player$': '<rootDir>/src/__mocks__/react-native-track-player-stub.js',
  },
};
