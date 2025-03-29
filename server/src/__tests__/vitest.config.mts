import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    setupFiles: './vitest.setup.ts',
    environment: 'node',
    env: {
      SECRET: 'test',
      NODE_ENV: 'test',
    },
    alias: {
      '@modules': path.resolve(__dirname, '../modules'),
      '@infrastructure': path.resolve(__dirname, '../infrastructure'),
      '@core': path.resolve(__dirname, '../core'),
      '@common': path.resolve(__dirname, '../common'),
      '@config': path.resolve(__dirname, '../config'),
    },
  },
});
