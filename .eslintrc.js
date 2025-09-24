module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  settings: {
    'import/core-modules': ['crypto'],
    'import/resolver': {
      typescript: {
        project: ['tsconfig.json'],
        tsconfigRootDir: __dirname,
        alwaysTryTypes: true,
      },
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'import/no-unresolved': ['error', { ignore: ['^node:', '^crypto$'] }],
    'import/no-named-as-default': 'off',
    'import/no-named-as-default-member': 'off',
    'import/order': [
      'error',
      {
        alphabetize: { order: 'asc', caseInsensitive: true },
        groups: [['builtin', 'external'], ['internal'], ['parent', 'sibling', 'index']],
        'newlines-between': 'always',
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        warnOnUnassignedImports: true,
      },
    ],
  },
  ignorePatterns: ['dist', 'node_modules'],
};
