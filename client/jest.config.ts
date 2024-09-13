import { Config, configUmiAlias, createConfig } from '@umijs/max/test';

export default async () => {
  try {
    return (await configUmiAlias({
      ...createConfig({
        target: 'browser',
        jsTransformer: 'esbuild',
        // config opts for esbuild , it will pass to esbuild directly
        jsTransformerOpts: { jsx: 'automatic' },
      }),
      transform: {
        '^.+\\.tsx?$': 'ts-jest',
        '^.+\\.jsx?$': 'babel-jest',
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@@/(.*)$': '<rootDir>/src/.umi/$1',
        '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
        '\\.(gif|ttf|eot|svg|png)$': 'jest-transform-stub',
      },
      setupFilesAfterEnv: ['<rootDir>/tests/jest-setup.ts'],
      // if you require some es-module npm package, please uncomment below line and insert your package name
      // transformIgnorePatterns: ['node_modules/(?!.*(lodash-es|your-es-pkg-name)/)']
    })) as Config.InitialOptions;
  } catch (e) {
    console.log(e);
    throw e;
  }
};
