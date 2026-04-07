import js from '@eslint/js';
import compat from 'eslint-plugin-compat';

export default [
  js.configs.recommended,
  compat.configs['flat/recommended'],
  { ignores: ['es5'] },
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',
      'arrow-body-style': ['error', 'as-needed'],
      'no-var': 'error',
      'prefer-template': 'error',
      'no-console': 'error',
    },
  },
];
