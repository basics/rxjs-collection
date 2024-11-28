import { defineProject } from 'vitest/config';

export default defineProject({
  cacheDir: '../.cache/vitest-playground',
  test: {
    cacheDir: '../.cache/vitest',
    setupFiles: ['../../setup.js'],
    testTimeout: 10000,
    environment: 'happy-dom'
  }
});
