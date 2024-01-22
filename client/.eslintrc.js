module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  globals: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: true,
    page: true,
    REACT_APP_ENV: true,
  },
  // ...
  rules: {
    "@typescript-eslint/no-parameter-properties": "off",
    "@typescript-eslint/consistent-type-imports": "off",
    '@typescript-eslint/switch-exhaustiveness-check': "off"
  }
};
