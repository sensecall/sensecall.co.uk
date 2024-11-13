/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{html,js,jsx}',
    './src/**/*.njk',
    './src/pages/**/*.njk',
    './src/_includes/**/*.njk'
  ],
  theme: {
    fontFamily: {
      'serif': ['"Crimson Pro"', 'serif'],
      'sans': ['"Work Sans"', 'sans-serif'],
    },
    typography: {
      DEFAULT: {
        css: {
          color: '#384042',
          a: {
            color: '#1d4ed8',
            '&:hover': {
              color: '#1e40af',
            },
          },
          'h1,h2,h3,h4': {
            fontFamily: '"Crimson Pro", serif',
            fontWeight: '700',
          },
        },
      },
      dark: {
        css: {
          color: '#e0e2e3',
          a: {
            color: '#ff5773',
            '&:hover': {
              color: '#ff8599',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ]
}