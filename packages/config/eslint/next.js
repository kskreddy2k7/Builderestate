const base = require('./base')

/** @type {import('eslint').Linter.Config} */
module.exports = {
  ...base,
  extends: [
    ...base.extends,
    'next/core-web-vitals',
    'plugin:jsx-a11y/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  plugins: [...(base.plugins || []), 'react', 'react-hooks', 'jsx-a11y'],
  rules: {
    ...base.rules,
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    '@next/next/no-html-link-for-pages': 'error',
  },
  settings: {
    ...base.settings,
    react: { version: 'detect' },
  },
}
