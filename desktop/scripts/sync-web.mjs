import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const desktopRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = resolve(desktopRoot, '..');
const webDir = resolve(desktopRoot, 'www');

if (!webDir.startsWith(`${desktopRoot}${sep}`)) {
  throw new Error('Diretório web fora da pasta desktop. Sincronização interrompida.');
}

if (existsSync(webDir)) rmSync(webDir, { recursive: true, force: true });
mkdirSync(webDir, { recursive: true });

for (const directory of ['css', 'html', 'imgs', 'js']) {
  cpSync(join(projectRoot, directory), join(webDir, directory), { recursive: true });
}

console.log(`Arquivos web sincronizados em ${relative(projectRoot, webDir)}.`);
