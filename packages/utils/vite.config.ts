import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dts from 'vite-plugin-dts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    dts({
      include: ['src'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
      copyDtsFiles: true,
      staticImport: true,
      insertTypesEntry: true,
    }),
  ],
  build: {
    outDir: join(__dirname, 'dist'),
    emptyOutDir: true,
    lib: {
      entry: join(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: [],
    },
    sourcemap: true,
  },
});
