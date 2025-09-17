import { defineProject } from 'vitest/config';

export default defineProject({
  cacheDir: '../.cache/vitest-operators',
  test: {
    testTimeout: 20000,
    environment: 'happy-dom'
  }
});
