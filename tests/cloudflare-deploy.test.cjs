'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

test('Cloudflare deploy serves only the generated site without server code or paid bindings', () => {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'wrangler.json'), 'utf8'));
  assert.equal(config.name, 'hcp');
  assert.equal(config.assets.directory, './public');
  assert.equal(config.assets.html_handling, 'none');
  assert.equal(config.assets.not_found_handling, 'none');
  assert.equal(config.build.command, 'node scripts/build-static.cjs');
  assert.equal(config.workers_dev, true);
  assert.equal(config.main, undefined);
  assert.equal(config.routes, undefined);
  assert.equal(config.vars, undefined);
  assert.deepEqual(Object.keys(config).sort(), ['assets', 'build', 'compatibility_date', 'name', 'workers_dev']);
});

test('Cloudflare package redirects the root to login and excludes the local build marker', () => {
  const output = path.join(root, 'public');
  assert.equal(fs.readFileSync(path.join(output, '_redirects'), 'utf8'), '/ /html/login.html 302\n');
  const ignored = fs.readFileSync(path.join(output, '.assetsignore'), 'utf8');
  assert.ok(ignored.split('\n').includes('.hcp-static-output'));
  assert.ok(ignored.split('\n').includes('.assetsignore'));
  const pending = [output];
  while (pending.length) {
    const current = pending.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const file = path.join(current, entry.name);
      assert.ok(!/^\.env(?:\.|$)|^\.dev\.vars|^auth\.toml$|^\.git$|^\.vercel$/.test(entry.name), `Private file in output: ${file}`);
      if (entry.isDirectory()) pending.push(file);
    }
  }
});
