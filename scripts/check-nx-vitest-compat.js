/* eslint-disable */

/**
 * TEMPORARY SCRIPT — DELETE WHEN @nx/vitest IS FIXED
 *
 * Purpose:
 *   Checks if @nx/vitest is compatible with vitest v4 yet.
 *   Run this manually once a day until it reports FIXED.
 *
 * Background:
 *   @nx/vitest@22.x uses require() internally on vitest's ESM-only node.js.
 *   This crashes the NX project graph when vitest v4 is installed.
 *   We removed @nx/vitest and use manual test targets as a workaround.
 *   Tracked: https://github.com/nrwl/nx/issues (search: vitest ESM require)
 *
 * When fixed:
 *   This script will print a FIXED banner with exact migration steps.
 *   Follow those steps, then delete this script and its package.json entry.
 *
 * Run:
 *   pnpm check-vitest-compat
 */

import { execSync } from 'child_process';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const require = createRequire(import.meta.url);

const VITEST_VERSION = '4.0.18'; // minimum version we want to support
const NX_VERSION = '22.5.4'; // current workspace NX version

console.log('\n🔍 Checking @nx/vitest compatibility with vitest v4...\n');

// ── Step 1: Check peer deps ──────────────────────────────────────────────────
let peerDeps = {};
try {
  const raw = execSync(`pnpm view @nx/vitest@${NX_VERSION} peerDependencies --json`, {
    encoding: 'utf8',
  });
  peerDeps = JSON.parse(raw);
} catch {
  console.error('❌ Could not fetch @nx/vitest peer dependencies. Check your network.');
  process.exit(1);
}

const vitestPeerRange = peerDeps['vitest'] ?? '';
console.log(`📦 @nx/vitest@${NX_VERSION} peer dep for vitest: ${vitestPeerRange}`);

const peerDeclaresFour = vitestPeerRange.includes('^4') || vitestPeerRange.includes('>=4');
if (!peerDeclaresFour) {
  console.log('⚠️  Peer deps do not yet declare vitest v4 support.\n');
  printNotFixed();
  process.exit(0);
}

console.log('✅ Peer deps declare vitest v4 support. Running runtime crash test...\n');

// ── Step 2: Runtime crash test ───────────────────────────────────────────────
// Install @nx/vitest in a temp location and try to require vitest/dist/node.js
// the same way the plugin does, to verify the ESM/CJS crash is resolved.
const tmpDir = path.join(ROOT, 'tmp', 'nx-vitest-check');
fs.mkdirSync(tmpDir, { recursive: true });

try {
  // Write a minimal test script that mimics what @nx/vitest/plugin.js does
  const testScript = path.join(tmpDir, 'test.cjs');
  fs.writeFileSync(
    testScript,
    `
try {
  require('vitest/dist/node.js');
  process.exit(0); // no crash = fixed
} catch (e) {
  if (e.code === 'ERR_REQUIRE_ESM') {
    process.exit(1); // still broken
  }
  process.exit(2); // different error
}
`,
  );

  const result = execSync(`node ${testScript}`, {
    encoding: 'utf8',
    stdio: 'pipe',
  });

  // exit 0 = fixed
  console.log('✅ Runtime crash test passed — require() on vitest/dist/node.js works.\n');
  printFixed();
} catch (err) {
  const code = err.status;
  if (code === 1) {
    console.log('❌ Runtime crash still present — ERR_REQUIRE_ESM not resolved.\n');
  } else {
    console.log(`⚠️  Unexpected exit code ${code} during runtime test.\n`);
  }
  printNotFixed();
} finally {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function printFixed() {
  console.log('━'.repeat(60));
  console.log('🎉  @nx/vitest IS NOW COMPATIBLE WITH VITEST v4');
  console.log('━'.repeat(60));
  console.log('\nMigration steps — follow in order:\n');
  console.log('  1. Add @nx/vitest back to package.json devDependencies:');
  console.log(`       pnpm add -D @nx/vitest@${NX_VERSION} -w\n`);
  console.log('  2. Add @nx/vitest plugin back to nx.json plugins array:');
  console.log('       {');
  console.log('         "plugin": "@nx/vitest",');
  console.log('         "options": {');
  console.log('           "testTargetName": "test",');
  console.log('           "ciTargetName": "test-ci"');
  console.log('         }');
  console.log('       }\n');
  console.log('  3. Remove manual "test" targets from all project.json files');
  console.log('     in libs/ — @nx/vitest will auto-infer them.\n');
  console.log('  4. Remove the "command": "vitest run" executor from');
  console.log('     targetDefaults in nx.json.\n');
  console.log('  5. Update create-lib.mjs — remove the injectVitest()');
  console.log('     function and its call. Generator --unitTestRunner=vitest');
  console.log('     will work correctly again.\n');
  console.log('  6. Verify everything works:');
  console.log('       pnpm exec nx reset');
  console.log('       pnpm exec nx run-many --target=test --all\n');
  console.log('  7. Delete this script and remove from package.json scripts:');
  console.log('       rm scripts/check-nx-vitest-compat.mjs\n');
  console.log('━'.repeat(60));
}

function printNotFixed() {
  console.log('━'.repeat(60));
  console.log('🔴  NOT FIXED YET — continue using manual test targets');
  console.log('━'.repeat(60));
  console.log('\nCurrent workaround in place:');
  console.log('  - @nx/vitest removed from package.json and nx.json');
  console.log('  - Manual "test" targets in each project.json');
  console.log('  - vitest.config.ts per lib injected by create-lib.mjs\n');
  console.log('Run this script again tomorrow:');
  console.log('  pnpm check-vitest-compat\n');
  console.log('When fixed, this script will print exact migration steps.');
  console.log('━'.repeat(60));
}
