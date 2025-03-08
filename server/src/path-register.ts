// Register path aliases
import { join } from 'path';
import { register } from 'tsconfig-paths';

// Register the path aliases from tsconfig.json
register({
  baseUrl: './dist',
  paths: {
    '@modules/*': ['modules/*'],
    '@common/*': ['common/*'],
    '@config/*': ['config/*'],
  },
});