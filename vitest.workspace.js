import { readFileSync } from 'node:fs';
import { defineWorkspace } from 'vitest/config';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineWorkspace([
  ...pkg.workspaces
    .filter(name => !['scripts'].includes(name))
    .map(name => ({
      extends: `./${name}/vitest.config.js`,
      test: {
        root: `./${name}`,
        name
      }
    }))
]);
