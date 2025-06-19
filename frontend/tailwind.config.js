/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-blue': '#001f3f',
        'wave-blue': '#0077be',
        'sea-foam': '#e0f7fa',
        'aqua-glow': '#00e5ff',
        'coral': '#ff6b6b',
        'azure': '#0077be',
        'primary': '#005f73',
        'primary-focus': '#004c5c',
        'secondary': '#0a9396',
        'accent': '#ee9b00',
        'neutral': '#212529',
        'base-100': '#0d1117',
        'info': '#94d2bd',
        'success': '#198754',
        'warning': '#ffc107',
        'error': '#dc3545',
        'bubble': 'rgba(10, 147, 150, 0.2)',
      },
      fontFamily: {
        sans: ['"Poppins"', 'sans-serif'],
        display: ['"Orbitron"', 'sans-serif'],
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(135deg, #001f3f 0%, #0077be 100%)',
        'navy-teal-gradient': 'linear-gradient(135deg, #0d1117 0%, #005f73 100%)',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(0, 229, 255, 0.6)',
        'deep-glow': '0 0 20px rgba(0, 31, 63, 0.8)',
        'card': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'bubble': '0 0 20px rgba(255, 255, 255, 0.1)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.8' },
          '50%': { opacity: '1' },
        },
        wave: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '200% 200%' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'bubble-float': {
          '0%': { transform: 'translateY(100vh) scale(0)' },
          '50%': { transform: 'translateY(50vh) scale(1)' },
          '100%': { transform: 'translateY(-100vh) scale(0)' }
        }
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'pulse-slow': 'pulse-slow 10s ease-in-out infinite',
        'wave': 'wave 8s linear infinite',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'bubble-float': 'bubble-float 8s linear infinite'
      }
    },
  },
  plugins: [],
};