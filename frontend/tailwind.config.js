/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // A modern, ocean-inspired color palette
        'primary': '#005f73',      // Deep Teal/Blue
        'primary-focus': '#004c5c',
        'secondary': '#0a9396',    // Bright Teal
        'accent': '#ee9b00',       // Sandy/Coral Orange
        'neutral': '#212529',      // Dark Charcoal for text
        'base-100': '#f8f9fa',     // Off-white/Light Gray background
        'info': '#94d2bd',         // Light seafoam green
        'success': '#198754',      // Bootstrap Green
        'warning': '#ffc107',      // Bootstrap Yellow
        'error': '#dc3545',        // Bootstrap Red
      },
      fontFamily: {
        // Using a clean, modern sans-serif font
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}