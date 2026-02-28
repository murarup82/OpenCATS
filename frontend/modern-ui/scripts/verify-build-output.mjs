import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(scriptDir, '../../../public/modern-ui/build');
const bundlePath = path.resolve(outputDir, 'app.bundle.js');
const manifestPath = path.resolve(outputDir, 'asset-manifest.json');

let failed = false;

if (!fs.existsSync(bundlePath)) {
  process.stderr.write(`[modern-ui] Missing bundle: ${bundlePath}\n`);
  failed = true;
}

if (!fs.existsSync(manifestPath)) {
  process.stderr.write(`[modern-ui] Missing asset manifest: ${manifestPath}\n`);
  failed = true;
}

if (failed) {
  process.exit(1);
}

process.stdout.write('[modern-ui] Build output verified successfully.\n');
