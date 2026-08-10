import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const mobileRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = resolve(mobileRoot, '..');
const webDir = resolve(mobileRoot, 'www');

if (!webDir.startsWith(`${mobileRoot}\\`) && webDir !== join(mobileRoot, 'www')) {
  throw new Error('Diretório web fora da pasta mobile. Sincronização interrompida.');
}

if (existsSync(webDir)) rmSync(webDir, { recursive: true, force: true });
mkdirSync(webDir, { recursive: true });

for (const directory of ['css', 'html', 'imgs', 'js']) {
  cpSync(join(projectRoot, directory), join(webDir, directory), { recursive: true });
}

cpSync(join(mobileRoot, 'index.html'), join(webDir, 'index.html'));
console.log(`Arquivos web sincronizados em ${relative(projectRoot, webDir)}.`);
