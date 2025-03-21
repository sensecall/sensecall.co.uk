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