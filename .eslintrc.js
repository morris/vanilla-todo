module.exports = {
  extends: ['eslint:recommended', 'plugin:compat/recommended'],
  globals: {
    Set: 'readonly',
    Map: 'readonly',
  },
  env: {
    browser: true,
  },
  parserOptions: {
    ecmaVersion: 5,
  },
  rules: {},
  settings: {
    polyfills: ['Array.from', 'Set', 'Map', 'fetch', 'Object.assign'],
  },
};
