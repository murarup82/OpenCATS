import path from 'node:path';
import fs from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const outputDir = path.resolve(__dirname, '../../public/modern-ui/build');

function writeAssetManifestPlugin() {
  return {
    name: 'opencats-asset-manifest',
    writeBundle(_options: unknown, bundle: Record<string, any>) {
      const entries = Object.values(bundle).filter((item: any) => item && item.type === 'chunk' && item.isEntry);
      const primary = entries.find((item: any) => item.name === 'mount') || entries[0];
      const fileName = primary && primary.fileName ? String(primary.fileName) : 'app.bundle.js';
      const manifestPath = path.resolve(outputDir, 'asset-manifest.json');
      const payload = {
        version: 1,
        generatedAtUTC: new Date().toISOString(),
        entries: {
          'src/mount.tsx': fileName
        }
      };
      fs.writeFileSync(manifestPath, JSON.stringify(payload, null, 2), { encoding: 'utf8' });
    }
  };
}

export default defineConfig({
  plugins: [react(), writeAssetManifestPlugin()],
  build: {
    outDir: outputDir,
    emptyOutDir: true,
    sourcemap: true,
    target: 'es2019',
    cssCodeSplit: false,
    reportCompressedSize: false,
    manifest: true,
    lib: {
      entry: path.resolve(__dirname, 'src/mount.tsx'),
      name: 'OpenCATSModernBundle',
      formats: ['iife'],
      fileName: () => 'app.bundle.js'
    }
  }
});
