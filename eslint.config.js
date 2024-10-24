import js from '@eslint/js';
// https://github.com/nickdeis/eslint-plugin-no-secrets
import noSecrets from 'eslint-plugin-no-secrets';
// https://github.com/azat-io/eslint-plugin-perfectionist
import perfectionist from 'eslint-plugin-perfectionist';
// https://github.com/prettier/eslint-plugin-prettier
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
// https://github.com/eslint-community/eslint-plugin-security
import eslintPluginSecurity from 'eslint-plugin-security';
// https://github.com/vitest-dev/eslint-plugin-vitest
import vitest from 'eslint-plugin-vitest';
import globals from 'globals';

import eslintIgnores from './eslint.ignores.js';

export default [
  eslintPluginSecurity.configs.recommended,
  eslintPluginPrettierRecommended,
  js.configs.recommended,
  {
    files: ['**/*.js'],
    ignores: eslintIgnores,
    languageOptions: {
      globals: {
        ...globals.browser,
        expect: 'readonly',
        global: 'readonly'
      }
    },
    plugins: {
      vitest,
      'no-secrets': noSecrets,
      perfectionist
    },
    rules: {
      'block-spacing': 'error',
      complexity: ['error', { max: 7 }],
      camelcase: 'error',
      // 'import/order': ['error', { groups: ['builtin', 'external', 'parent', 'sibling', 'index'] }],
      'no-console': 'warn',
      'no-debugger': 'warn',
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1 }],
      'no-unused-vars': 'warn',
      'no-secrets/no-secrets': 'error',
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'alphabetical',
          order: 'asc',
          ignoreCase: true,
          internalPattern: ['~/**'],
          newlinesBetween: 'always',
          maxLineLength: undefined,
          groups: [
            'type',
            ['builtin', 'external'],
            'internal-type',
            'internal',
            ['parent-type', 'sibling-type', 'index-type'],
            ['parent', 'sibling', 'index'],
            'object',
            'unknown'
          ],
          customGroups: { type: {}, value: {} },
          environment: 'node'
        }
      ]
    }
  }
];
