// ESLint base rules — recommended set (no-unused-vars, no-undef, etc.)
import eslint from '@eslint/js';

// Modern ESLint config helper (replaces deprecated tseslint.config())
import { defineConfig } from 'eslint/config';

// TypeScript-aware ESLint rules
import tseslint from 'typescript-eslint';

// Disables ESLint rules that conflict with Prettier formatting
import prettierConfig from 'eslint-config-prettier';

// Enforces correct import order and grouping
import importPlugin from 'eslint-plugin-import-x';

// Removes unused imports automatically
import unusedImports from 'eslint-plugin-unused-imports';

// Provides browser/node/es global variables
import globals from 'globals';

// Node.js built-ins for resolving file paths in ESM
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// ESM modules don't have __dirname — reconstruct it manually
const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(
  // Folders and files ESLint should completely skip
  {
    ignores: [
      '**/node_modules/**', // Dependencies — never lint these
      '**/dist/**', // Compiled output
      '**/.next/**', // Next.js build output
      '**/.expo/**', // Expo build otput
      '**/coverage/**', // Test coverage reports
      '**/build/**', // Other build outputs
      '**/*.config.ts', // prisma.config.ts, jest.config.ts ...etc
    ],
  },

  {
    // Only lint TypeScript files
    files: ['**/*.ts', '**/*.tsx'],

    // Extend recommended rule sets
    extends: [
      eslint.configs.recommended, // ESLint base rules
      ...tseslint.configs.recommended, // TypeScript rules
      prettierConfig, // Disable formatting rules (Prettier handles those)
    ],

    // Register plugins to use their rules
    plugins: {
      import: importPlugin,
      'unused-imports': unusedImports,
    },

    languageOptions: {
      // Global variables available in all files
      globals: {
        ...globals.node, // process, __dirname, Buffer, etc.
        ...globals.es2022, // Promise, Map, Set, structuredClone, etc.
      },
      // parserOptions: {
      //   // Root directory for resolving tsconfig paths
      //   tsconfigRootDir: __dirname,

      //   // All tsconfig files in the monorepo — parser needs to know all of them
      //   project: [
      //     './tsconfig.json', // Root (Project References)
      //     './apps/api/tsconfig.json', // NestJS API
      //     './packages/shared/tsconfig.json', // Shared types
      //   ],
      // },
    },

    rules: {
      // Disable default TS unused vars — use unused-imports plugin instead
      '@typescript-eslint/no-unused-vars': 'off',

      // Error if an import is present but never used in the file
      'unused-imports/no-unused-imports': 'error',

      // Error for unused variables — except those prefixed with _
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_', // _foo is intentionally unused
          args: 'after-used',
          argsIgnorePattern: '^_', // (_req, res) — _req intentionally skipped
        },
      ],

      // Force 'import type' for type-only imports — better tree shaking
      '@typescript-eslint/consistent-type-imports': 'error',

      // Enforce consistent import grouping and order
      'import/order': [
        'error',
        {
          groups: [
            'builtin', // node:fs, node:path
            'external', // nestjs, express, zod
            'internal', // @arena/shared
            'parent', // ../module
            'sibling', // ./module
            'index', // ./index
          ],
          pathGroups: [
            {
              pattern: '@football/**',
              group: 'internal',
              position: 'before',
            },
          ],
          'newlines-between': 'always', // Blank line between each group
          alphabetize: {
            order: 'asc', // Sort A → Z within each group
            caseInsensitive: true,
          },
        },
      ],

      // Warn on 'any' type — allowed but discouraged
      '@typescript-eslint/no-explicit-any': 'warn',

      // Prevent variable shadowing in nested scopes (TS-aware version)
      '@typescript-eslint/no-shadow': 'error',

      // Disable base rule — conflicts with @typescript-eslint/no-shadow
      'no-shadow': 'off',

      // Warn on console.log — allow warn and error for intentional logging
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
);
