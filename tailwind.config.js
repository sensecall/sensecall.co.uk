/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './_site/**/*.html',
    './src/**/*.{html,js,jsx,md,njk,liquid,webc}'
  ],
  theme: {
    fontFamily: {
      'serif': ['"Crimson Pro"', 'serif'],
      'sans': ['"Work Sans"', 'sans-serif'],
    },
  },
  plugins: []
}