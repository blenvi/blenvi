import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginReact from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';
import pluginNext from '@next/eslint-plugin-next';
import { config as baseConfig } from './base.js';

/**
 * A comprehensive ESLint configuration for Next.js applications with import sorting.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const nextJsConfig = [
  ...baseConfig,
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended,
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.serviceworker,
      },
    },
  },
  {
    plugins: {
      '@next/next': pluginNext,
    },
    rules: {
      ...pluginNext.configs.recommended.rules,
      ...pluginNext.configs['core-web-vitals'].rules,
    },
  },
  {
    plugins: {
      'react-hooks': pluginReactHooks,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,

      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // Code quality rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-unused-vars': 'off', // Let TypeScript handle this
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      // Accessibility rules
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/aria-role': 'warn',
    },
  },
  // Import plugin configuration
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'import-x': importPlugin,
    },
    rules: {
      // Import sorting - disable the built-in rule since we'll use import-x
      'sort-imports': 'off',
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          pathGroups: [
            {
              pattern: 'react',
              group: 'builtin',
              position: 'before',
            },
            {
              pattern: 'next/**',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@/**',
              group: 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['react'],
        },
      ],
    },
  },
  // Prettier config must be last to disable conflicting rules
  eslintConfigPrettier,
];
