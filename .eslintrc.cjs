/* Minimal ESLint config for React + TypeScript (Vite) */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2023: true,
    node: false,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    // Rely on TS for undefined checks
    'no-undef': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-empty': 'warn',
    'no-useless-catch': 'warn',
    'no-useless-escape': 'warn',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'public/',
    'FitForgeBackend-main/',
  ],
};
