import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(scriptDir, '../../../public/modern-ui/build');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  process.stdout.write(`[modern-ui] Created build output directory: ${outputDir}\n`);
  process.exit(0);
}

const entries = fs.readdirSync(outputDir);
for (const entry of entries) {
  const target = path.join(outputDir, entry);
  fs.rmSync(target, { recursive: true, force: true });
}

process.stdout.write(`[modern-ui] Cleaned build output directory: ${outputDir}\n`);
