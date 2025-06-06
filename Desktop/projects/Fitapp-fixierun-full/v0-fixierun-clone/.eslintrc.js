module.exports = {
  root: true,
  extends: [
    '@vercel/style-guide/eslint/node',
    '@vercel/style-guide/eslint/typescript',
    '@vercel/style-guide/eslint/browser',
    '@vercel/style-guide/eslint/react',
    '@vercel/style-guide/eslint/next',
  ],
  parserOptions: {
    project: ['./tsconfig.json', './apps/*/tsconfig.json', './packages/*/tsconfig.json'],
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: ['./tsconfig.json', './apps/*/tsconfig.json', './packages/*/tsconfig.json'],
      },
    },
  },
  rules: {
    // Custom rules for blockchain development
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'import/no-default-export': 'off',
    'react/function-component-definition': 'off',
    'unicorn/filename-case': 'off',
    '@next/next/no-html-link-for-pages': 'off',
  },
  overrides: [
    {
      files: ['**/*.sol'],
      parser: '@solidity-parser/parser',
      rules: {
        // Solidity specific rules
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.next/',
    'typechain-types/',
    'artifacts/',
    'cache/',
  ],
};