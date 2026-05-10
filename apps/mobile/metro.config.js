const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Monorepo root (two levels up from apps/mobile)
const monorepoRoot = path.resolve(__dirname, '../..');

const config = getDefaultConfig(__dirname);

// Resolve workspace packages from monorepo root node_modules
config.watchFolders = [monorepoRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Map @btd/* workspace package names to their src directories
config.resolver.extraNodeModules = {
  '@btd/ui-tokens': path.resolve(monorepoRoot, 'packages/ui-tokens'),
  '@btd/shared': path.resolve(monorepoRoot, 'packages/shared'),
  '@btd/firebase-config': path.resolve(monorepoRoot, 'packages/firebase-config'),
};

module.exports = config;
