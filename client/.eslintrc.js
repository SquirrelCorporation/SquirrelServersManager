module.exports = {
  extends: [require.resolve('umi/eslint'), require.resolve('@umijs/max/eslint')],
  globals: {
    page: true,
    REACT_APP_ENV: true,
  },
};
