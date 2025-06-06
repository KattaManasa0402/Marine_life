/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Include all JS/TS files in src
  ],
  theme: {
    extend: {
      colors: {
        ocean: '#1e3a8a', // Marine-themed color
        coral: '#ff6b6b', // Marine-themed color
      },
    },
  },
  plugins: [],
}