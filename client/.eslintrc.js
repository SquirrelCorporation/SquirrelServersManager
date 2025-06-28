module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  plugins: ['boundaries'],
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
    // FSD boundary rules (warning mode for gradual adoption)
    'boundaries/element-types': [
      'warn',
      {
        default: 'disallow',
        rules: [
          {
            from: 'features',
            allow: ['shared', 'app'],
            disallow: ['features'] // No cross-feature imports
          },
          {
            from: 'shared',
            allow: ['shared'],
            disallow: ['features', 'app', 'pages']
          }
        ]
      }
    ],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@/components/*', '@/legacy-components/*'],
            message: '🚫 LEGACY COMPONENT IMPORT BLOCKED: Use @features/* or @shared/ui/* instead. 118 components in /legacy-components/ need FSD migration. See CLIENT_FSD_MIGRATION_REFERENCE.md'
          },
          {
            group: ['../components/*', './components/*', '../../components/*', '../legacy-components/*', './legacy-components/*', '../../legacy-components/*'],
            message: '🚫 RELATIVE LEGACY IMPORT BLOCKED: Use @features/* or @shared/ui/* instead'
          }
        ],
        paths: [
          {
            name: '@/components',
            message: '🚫 LEGACY COMPONENTS BLOCKED: Components directory renamed to /legacy-components/. Migrate to FSD structure'
          },
          {
            name: '@/legacy-components',
            message: '🚫 LEGACY COMPONENTS BLOCKED: All components in /legacy-components/ must be migrated to FSD structure'
          }
        ]
      }
    ],
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ImportDeclaration[source.value*="/components/"], ImportDeclaration[source.value*="/legacy-components/"]',
        message: '🚫 LEGACY COMPONENT PATH: Migrate to FSD structure (@features/* or @shared/ui/*)'
      }
    ]
  },
};
