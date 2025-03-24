/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,js,njk,md}",
    "./_site/**/*.{html,js,njk,md}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#243e64',
        // Add other custom colors if needed
      },
      typography: {
        DEFAULT: {
          css: {
            'code::before': {
              content: '""'
            },
            'code::after': {
              content: '""'
            },
            'code': {
              color: '#1F2937',
              backgroundColor: '#F3F4F6',
              padding: '0.25rem 0.375rem',
              borderRadius: '0.25rem',
              fontSize: '0.875em'
            },
            'pre code': {
              backgroundColor: 'transparent',
              padding: '0',
              color: 'inherit'
            },
            'h1, h2, h3, h4, h5, h6': {
              marginBottom: '0.5rem',
            },
            'ul > li, ol > li': {
              marginTop: '0.25rem',
              marginBottom: '0.25rem',
            },
            'ul, ol': {
              marginTop: '1rem',
              marginBottom: '1rem',
            },
            '.dark code': {
              color: '#E5E7EB',
              backgroundColor: '#374151'
            }
          }
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}