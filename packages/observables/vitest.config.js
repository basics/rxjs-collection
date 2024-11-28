import { defineProject } from 'vitest/config';

export default defineProject({
  cacheDir: '../.cache/vitest-observables',
  test: {
    cacheDir: '../.cache/vitest',
    setupFiles: ['../../setup.js'],
    environment: 'happy-dom'
  }
});
