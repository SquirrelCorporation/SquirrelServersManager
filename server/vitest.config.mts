import path from 'path';
import { configDefaults, defineConfig } from 'vitest/config';

const config = defineConfig({
  base: '/',
  resolve: {
    alias: [
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
    ],
  },
  test: {
    ...configDefaults,
    globals: true,
  },
});

export default config;
