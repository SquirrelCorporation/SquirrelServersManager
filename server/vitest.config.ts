import { resolve } from 'path';
import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    include: ['**/__tests__/**/*.spec.ts'],
    exclude: ['**/*.md'],
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
