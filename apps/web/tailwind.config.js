/** @type {import('tailwindcss').Config} */
const sharedConfig = require('@buildestate/config/tailwind')

module.exports = {
  ...sharedConfig,
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
}
