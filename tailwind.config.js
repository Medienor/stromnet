/* eslint-disable @typescript-eslint/no-require-imports */
// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx}',
      './src/components/**/*.{js,ts,jsx,tsx}',
      './src/app/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {
        fontFamily: {
          'inter': ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
          'dm-sans': ['var(--font-dm-sans)', ...defaultTheme.fontFamily.sans],
          'sans': ['var(--font-inter)', 'var(--font-dm-sans)', ...defaultTheme.fontFamily.sans],
        },
      },
    },
    plugins: [
      require('@tailwindcss/typography'),
      require('@tailwindcss/line-clamp'),
    ],
  }