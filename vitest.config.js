import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    cacheDir: './.cache/vitest',

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        ...configDefaults.exclude,
        'commitlint.config.js',
        'eslint.ignores.js',
        'vitest.workspace.js',
        './packages/mocks/',
        './packages/*/src/index.js'
      ]
    },
    include: ['./packages/**/*.test.js']
  }
});
