import { defineProject } from 'vitest/config';

export default defineProject({
  cacheDir: '../.cache/vitest-observables',
  test: {
    environment: 'happy-dom'
  }
});
