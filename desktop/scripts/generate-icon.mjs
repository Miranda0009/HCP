import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pngToIco from 'png-to-ico';

const desktopRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const projectRoot = resolve(desktopRoot, '..');
const source = join(projectRoot, 'imgs', 'logo.png');
const assetDir = join(desktopRoot, 'assets');
const destination = join(assetDir, 'hcp.ico');

if (!existsSync(source)) throw new Error(`Logo não encontrada em ${source}`);
mkdirSync(assetDir, { recursive: true });
writeFileSync(destination, await pngToIco(source));
console.log(`Ícone do Windows gerado em ${destination}.`);
