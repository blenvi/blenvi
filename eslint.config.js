// Root-level ESLint configuration for the monorepo
import { config as baseConfig } from './packages/eslint-config/base.js';

export default [
  ...baseConfig,
  {
    ignores: [
      // Build outputs
      '**/dist/**',
      '**/.next/**',
      '**/out/**',
      '**/.turbo/**',

      // Dependencies
      '**/node_modules/**',

      // Generated files
      '**/package-lock.json',
      '**/.env*',

      // Git
      '**/.git/**',
    ],
  },
];
