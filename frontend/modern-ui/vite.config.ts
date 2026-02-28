import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, '../../public/modern-ui'),
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, 'src/mount.tsx'),
      name: 'OpenCATSModernBundle',
      formats: ['iife'],
      fileName: () => 'app.bundle.js'
    }
  }
});

