import eslintPluginPromise from 'eslint-plugin-promise';
import eslintPluginImport from 'eslint-plugin-import';

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
      globals: {
        NodeJS: true,
      },
    },
    plugins: {
      promise: eslintPluginPromise,
      import: eslintPluginImport,
    },
    rules: {
      'comma-dangle': ['error', { arrays: 'always-multiline', objects: 'always-multiline' }],
      'eol-last': ['error', 'always'],
      'prefer-arrow-callback': 'error',
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': 'error',
      'no-console': 'off',
      'no-unused-vars': ['warn', { 
        'args': 'none',
        'ignoreRestSiblings': true, 
        'caughtErrors': 'none',
      }],
      'import/no-unresolved': [2, { ignore: ['^firebase-admin/.+', '^firebase-functions/.+'] }],
      'import/no-commonjs': 2,
      'import/extensions': [2, 'ignorePackages'],
      ...eslintPluginPromise.configs.recommended.rules,
    },
  },
];
