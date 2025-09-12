import { defineProject } from 'vitest/config';

export default defineProject({
  cacheDir: '../.cache/vitest-playground',
  test: {
    testTimeout: 10000,
    environment: 'happy-dom'
  }
});
