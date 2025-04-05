import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    root: path.resolve(__dirname, '../../../../'),
    alias: {
      '@modules': path.resolve(__dirname, '../../../'),
      '@infrastructure': path.resolve(__dirname, '../../../../infrastructure/'),
    },
  },
});