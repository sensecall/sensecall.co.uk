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
    typography: {
      DEFAULT: {
        css: {
          color: '#384042',
          a: {
            color: '#1d4ed8', // Tailwind blue
            '&:hover': {
              color: '#1e40af', // Darker Tailwind blue
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