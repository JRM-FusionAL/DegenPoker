const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const glob = require('glob');
const semver = require('semver');
const fingerprintPaths = require('@expo/fingerprint/build/utils/Path');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'degen-sdk-api-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const name of ['android/app/src/main/java/app/MainApplication.kt',
    'android/app/src/main/java/app/MainActivity.java', 'ios/App/AppDelegate.swift', '.fixture.map']) {
    const file = path.join(root, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, '// owned fixture only\n');
  }
  return root;
}

test('patched glob and minimatch versions are actually installed', () => {
  assert.ok(semver.gte(require('glob/package.json').version, '14.0.2'));
  assert.ok(semver.gte(require('minimatch/package.json').version, '11.0.1'));
});

test('Expo-used sync, async and streaming glob APIs agree on native source paths', async t => {
  const cwd = fixture(t);
  const pattern = '**/*.@(java|kt|swift)';
  const expected = ['android/app/src/main/java/app/MainActivity.java',
    'android/app/src/main/java/app/MainApplication.kt', 'ios/App/AppDelegate.swift'];
  assert.deepEqual(glob.globSync(pattern, { cwd }).sort(), expected);
  assert.deepEqual(glob.sync(pattern, { cwd }).sort(), expected);
  assert.deepEqual((await glob.glob(pattern, { cwd })).sort(), expected);
  const stream = [];
  for await (const file of glob.globStream(pattern, { cwd })) stream.push(file);
  assert.deepEqual(stream.sort(), expected);
});

test('actual Expo Android and iOS path consumers resolve owned fixtures', t => {
  const root = fixture(t);
  const android = require('@expo/config-plugins/build/android/Paths');
  const ios = require('@expo/config-plugins/build/ios/Paths');
  assert.equal(android.getProjectFilePath(root, 'MainApplication'),
    path.join(root, 'android/app/src/main/java/app/MainApplication.kt'));
  assert.equal(ios.getAppDelegateFilePath(root), path.join(root, 'ios/App/AppDelegate.swift'));
});

test('actual Expo fingerprint ignore and negation consumers retain semantics', () => {
  const matches = fingerprintPaths.buildPathMatchObjects(['**/*.map', '!keep.map']);
  assert.equal(fingerprintPaths.isIgnoredPathWithMatchObjects('skip.map', matches), true);
  assert.equal(fingerprintPaths.isIgnoredPathWithMatchObjects('keep.map', matches), false);
  assert.equal(matches[1].negate, true);
  assert.equal(matches[1].pattern, 'keep.map');
  fingerprintPaths.appendIgnorePath(matches, 'generated/**');
  assert.equal(fingerprintPaths.isIgnoredPathWithMatchObjects('generated/file.js', matches), true);
  const directories = fingerprintPaths.buildDirMatchObjects(
    fingerprintPaths.buildPathMatchObjects(['android/**', '!android/keep.js', 'ios/**']));
  assert.equal(directories.some(item => item.pattern === 'android'), false);
  assert.equal(directories.some(item => item.pattern === 'ios'), true);
});
