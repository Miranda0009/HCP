import { copyFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const mobileRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(mobileRoot, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
const releaseDir = join(mobileRoot, 'releases');
const destination = join(releaseDir, 'HCP-debug.apk');

if (!existsSync(source)) throw new Error(`APK não encontrado em ${source}`);
mkdirSync(releaseDir, { recursive: true });
copyFileSync(source, destination);
console.log(`APK gerado: ${destination} (${statSync(destination).size} bytes)`);
