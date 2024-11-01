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
      }
    },
  },
  plugins: [],
}