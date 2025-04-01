import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['**/__tests__/**/*.spec.ts'],
    exclude: ['**/*.md'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/__tests__/**', 'src/**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@modules': resolve(__dirname, './src/modules'),
      '@infrastructure': resolve(__dirname, './src/infrastructure'),
      '@common': resolve(__dirname, './src/common'),
      '@config': resolve(__dirname, './src/config'),
      'ssm-shared-lib': resolve(__dirname, '../shared-lib'),
    },
  },
});
