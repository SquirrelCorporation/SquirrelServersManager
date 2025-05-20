import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['**/*.spec.ts'],
    exclude: ['**/*.md'],
  },
  resolve: {
    alias: {
      '@modules': resolve(__dirname, '../../../modules'),
      '@infrastructure': resolve(__dirname, '../../../infrastructure'),
      '@common': resolve(__dirname, '../../../common'),
      '@config': resolve(__dirname, '../../../config'),
    },
  },
});