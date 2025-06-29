module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  globals: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: true,
    page: true,
    REACT_APP_ENV: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    requireConfigFile: false,
    babelOptions: {
      presets: ['@babel/preset-env'],
      plugins: [
        ['@babel/plugin-proposal-decorators', { legacy: true }],
        ['@babel/plugin-transform-class-properties', { loose: true }]
      ]
    },
    ecmaFeatures: {
      jsx: true,
      legacyDecorators: true
    }
  },
  // ...
  rules: {
    '@typescript-eslint/no-parameter-properties': 'off',
    '@typescript-eslint/consistent-type-imports': 'off',
    '@typescript-eslint/switch-exhaustiveness-check': 'off',
    '@typescript-eslint/no-throw-literal': 'off',
    '@typescript-eslint/consistent-indexed-object-style': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/type-annotation-spacing': 'off',
  },
};
