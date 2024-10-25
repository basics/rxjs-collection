import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    setupFiles: ['../../setup.js'],
    testTimeout: 10000,
    environment: 'happy-dom'
  }
});
