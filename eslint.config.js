import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import perfectionist from 'eslint-plugin-perfectionist';
import prettierConfig from 'eslint-config-prettier';
import nxPlugin from '@nx/eslint-plugin';

export default tseslint.config(
  // ─── Global Ignores ───────────────────────────────────────────────────────
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      'tmp/**',
      '**/dist/**',
      '**/*.config.mts',
      '**/*.config.mjs',
      '**/vite.config.*',
      '**/vitest.config.*',
      'vitest.workspace.ts',
    ],
  },

  // ─── Base JS ──────────────────────────────────────────────────────────────
  js.configs.recommended,

  // ─── TypeScript (strict + stylistic) ──────────────────────────────────────
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,

  // ─── NX Module Boundaries ─────────────────────────────────────────────────
  {
    plugins: {
      '@nx': nxPlugin,
    },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: ['^.+\\.config\\.(js|ts|mjs|mts)$'],
          depConstraints: [
            {
              sourceTag: 'type:utils',
              onlyDependOnLibsWithTags: [],
            },
            {
              sourceTag: 'scope:aklabs',
              onlyDependOnLibsWithTags: ['scope:aklabs'],
            },
          ],
        },
      ],
    },
  },

  // ─── TypeScript files ─────────────────────────────────────────────────────
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      perfectionist,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      // ── Import Sorting (auto-fixable on save) ──────────────────────────────
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'natural',
          order: 'asc',
          newlinesBetween: 1,
          groups: [
            ['type-builtin', 'type-external'],
            ['builtin', 'external'],
            ['type-internal'],
            ['internal'],
            ['type-parent', 'type-sibling', 'type-index'],
            ['parent', 'sibling', 'index'],
            'unknown',
          ],
          internalPattern: ['^@aklabs/.*'],
        },
      ],

      // ── TypeScript Overrides ───────────────────────────────────────────────
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
    },
  },

  // ─── Prettier (must be last — disables conflicting rules) ─────────────────
  prettierConfig,
);
