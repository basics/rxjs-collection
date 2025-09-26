#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cwd = resolve(__dirname, '..');

function run(cmd) {
  try {
    console.log(`👉 Running: ${cmd}`);
    execSync(cmd, { cwd, stdio: 'inherit' });
    return true;
  } catch (err) {
    console.warn(`⚠️ Failed: ${cmd} – ${err.message}`);
    return false;
  }
}

// 1️⃣ zuerst mit pnpm im Filter-Mode
if (!run('pnpm -F "./packages/**" run build --if-present')) {
  // 2️⃣ Fallback auf npm workspaces
  if (!run('npm run build --workspaces --if-present')) {
    console.error('❌ Build konnte nicht ausgeführt werden');
    process.exit(1);
  }
}
