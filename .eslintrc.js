module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:security/recommended',
    'prettier',
    // Disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    'prettier/@typescript-eslint',
    // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors.
    // This should always be the last configuration in the extends array.
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint', 'import', 'security'],
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true, // always try to resolve types under `<roo/>@types` directory even it doesn't contain any source code, like `@types/unist`
      },
    },
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    'no-plusplus': 'off',
    'import/no-named-as-default-member': 'off',
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    'import/no-internal-modules': 'off',
    'import/no-unresolved': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    'react/no-unescaped-entities': 'off',
    'react/prop-types': 'off',
    'react/no-find-dom-node': 'warn',
    'react/no-danger': 'error',
  },
};
