import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import _import from 'eslint-plugin-import-x';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends('eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'),
  {
    plugins: {
      '@typescript-eslint': typescriptEslint,
      import: _import,
      prettier,
      '@stylistic': stylistic,
    },
    languageOptions: {
      globals: {
        ...globals.node,
      },

      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },

    rules: {
      '@typescript-eslint/no-explicit-any': 'off',

      'no-empty': [
        'error',
        {
          allowEmptyCatch: true,
        },
      ],

      curly: ['error', 'all'],

      eqeqeq: [
        'error',
        'always',
        {
          null: 'ignore',
        },
      ],

      'no-caller': 'error',
      'no-new': 'error',
      'no-with': 'error',

      'brace-style': [
        'error',
        '1tbs',
        {
          allowSingleLine: true,
        },
      ],

      'func-call-spacing': ['error', 'never'],
      indent: 'off',
      'no-trailing-spaces': 'error',

      'key-spacing': [
        'error',
        {
          beforeColon: false,
          afterColon: true,
        },
      ],

      'keyword-spacing': 'error',
      'no-bitwise': 'error',

      'space-before-function-paren': [
        'error',
        {
          anonymous: 'ignore',
          named: 'never',
        },
      ],

      'space-infix-ops': 'error',

      'space-unary-ops': [
        'error',
        {
          words: false,
          nonwords: false,
        },
      ],

      'no-use-before-define': [
        'error',
        {
          functions: false,
        },
      ],

      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',

      'sort-imports': [
        'error',
        {
          ignoreCase: false,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
        },
      ],

      'import/newline-after-import': ['error'],

      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'never',
        },
      ],

      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'semi',
            requireLast: true,
          },

          singleline: {
            delimiter: 'semi',
            requireLast: false,
          },
        },
      ],

      '@typescript-eslint/no-require-imports': 'error',
    },
  },
];
