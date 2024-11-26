import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        ...configDefaults.exclude,
        'commitlint.config.js',
        'eslint.ignores.js',
        'vitest.workspace.js',
        './packages/observables/src/index.js',
        './packages/operators/src/index.js'
      ]
    },
    include: ['**/packages/**/*.test.js']
  }
});
