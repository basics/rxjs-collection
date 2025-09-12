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
        'coverage/**/*.*',
        'packages/mocks/',
        'packages/*/src/index.js',
        'packages/playground/**/*.test.js'
      ]
    },
    include: ['./packages/**/*.test.js', './packages/**/*.test.ts'],
    projects: [
      {
        extends: './packages/observables/vitest.config.ts'
      },
      {
        extends: './packages/operators/vitest.config.ts'
      },
      {
        extends: './packages/playground/vitest.config.ts'
      }
    ]
  }
});


