'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');

test('static build accepts empty output, publishes only web folders and protects unknown content', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'hcp-static-build-test-'));
  try {
    fs.mkdirSync(path.join(fixture, 'scripts'));
    fs.copyFileSync(path.join(root, 'scripts/build-static.cjs'), path.join(fixture, 'scripts/build-static.cjs'));
    for (const directory of ['html', 'css', 'js', 'imgs', 'docs', 'mobile', 'supabase']) {
      fs.mkdirSync(path.join(fixture, directory));
      fs.writeFileSync(path.join(fixture, directory, 'sample.txt'), directory);
    }
    const build = () => spawnSync(process.execPath, [path.join(fixture, 'scripts/build-static.cjs')], { encoding: 'utf8' });
    fs.mkdirSync(path.join(fixture, 'public'));
    assert.equal(build().status, 0);
    const output = path.join(fixture, 'public');
    assert.deepEqual(fs.readdirSync(output).sort(), ['.assetsignore', '.hcp-static-output', '_redirects', 'css', 'html', 'imgs', 'index.html', 'js'].sort());
    assert.match(fs.readFileSync(path.join(output, 'index.html'), 'utf8'), /url=html\/login\.html/);
    fs.writeFileSync(path.join(fixture, 'css', 'sample.txt'), 'updated');
    assert.equal(build().status, 0);
    assert.equal(fs.readFileSync(path.join(output, 'css', 'sample.txt'), 'utf8'), 'updated');
    fs.unlinkSync(path.join(output, '.hcp-static-output'));
    const refused = build();
    assert.notEqual(refused.status, 0);
    assert.match(refused.stderr, /refusing to replace/);
    assert.equal(fs.readFileSync(path.join(output, 'css', 'sample.txt'), 'utf8'), 'updated');
  } finally {
    if (path.dirname(fixture) === os.tmpdir() && path.basename(fixture).startsWith('hcp-static-build-test-')) {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  }
});

test('Vercel config points at the generated static site and a valid login entry', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  assert.equal(config.buildCommand, 'node scripts/build-static.cjs');
  assert.equal(config.outputDirectory, 'public');
  assert.equal(config.framework, null);
  assert.deepEqual(config.redirects, [
    { source: '/', destination: '/html/login.html', permanent: false },
    { source: '/login.html', destination: '/html/login.html', permanent: false }
  ]);
  assert.ok(fs.existsSync(path.join(root, 'html/login.html')));
});

test('HTML links and assets exist inside the generated public output', () => {
  const output = path.join(root, 'public');
  assert.ok(fs.existsSync(output), 'Run node scripts/build-static.cjs before this integration check.');
  const missing = [];
  const pages = ['index.html', ...fs.readdirSync(path.join(output, 'html')).filter(name => name.endsWith('.html')).map(name => `html/${name}`)];
  for (const name of pages) {
    const html = fs.readFileSync(path.join(output, name), 'utf8');
    for (const match of html.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/gi)) {
      const value = match[1];
      if (!value || value.startsWith('#') || /^[a-z][a-z\d+.-]*:/i.test(value) || value.startsWith('//')) continue;
      const address = new URL(value, `https://hcp.example/${name}`);
      const target = path.resolve(output, '.' + decodeURIComponent(address.pathname));
      if (!target.startsWith(output + path.sep) || !fs.existsSync(target)) missing.push(`${name}: ${value}`);
    }
  }
  assert.deepEqual(missing, []);
});
