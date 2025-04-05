import { resolve } from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['**/__tests__/**/*.spec.ts'],
    exclude: ['**/*.md'],
    setupFiles: ['./src/__tests__/test-setup.fixed.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/__tests__/**', 'src/**/*.d.ts'],
    },
  },
  resolve: {
    alias: [
      { find: '@modules', replacement: resolve(__dirname, './src/modules') },
      { find: '@infrastructure', replacement: resolve(__dirname, './src/infrastructure') },
      { find: '@common', replacement: resolve(__dirname, './src/common') },
      { find: '@config', replacement: resolve(__dirname, './src/config') },
      { find: '@middlewares', replacement: resolve(__dirname, './src/middlewares') },
      { find: 'ssm-shared-lib', replacement: resolve(__dirname, '../shared-lib') },
    ],
  },
});
