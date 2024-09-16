import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'clover'],
      reportsDirectory: './coverage',
      exclude: [
        ...configDefaults.exclude,
        'commitlint.config.js',
        'eslint.ignores.js',
        'vitest.workspace.js'
      ]
    },
    include: ['**/packages/**/*.test.js']
  }
});
