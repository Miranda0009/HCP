import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const desktopRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const makeDir = join(desktopRoot, 'out', 'make');
const releaseDir = join(desktopRoot, 'releases');
const destination = join(releaseDir, 'HCP-Setup.exe');

if (!existsSync(makeDir)) throw new Error(`Pasta do instalador não encontrada em ${makeDir}`);

const installer = readdirSync(makeDir, { recursive: true, withFileTypes: true })
  .filter((entry) => entry.isFile() && /^HCP[- ]Setup\.exe$/i.test(entry.name))
  .map((entry) => join(entry.parentPath, entry.name))[0];

if (!installer) throw new Error('Instalador HCP não encontrado após a compilação.');
mkdirSync(releaseDir, { recursive: true });
copyFileSync(installer, destination);
console.log(`Instalador gerado: ${destination} (${statSync(destination).size} bytes)`);
