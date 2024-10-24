import { defineProject } from 'vitest/config';

export default defineProject({
  test: {
    setupFiles: ['../../setup.js'],
    environment: 'happy-dom'
  }
});
