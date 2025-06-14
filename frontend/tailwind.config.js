/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ocean-base-light': '#EBF7FF',
        'ocean-light': '#D6EEFF',
        'ocean-medium': '#A8DADC',
        'ocean-primary': '#4DB6AC',
        'ocean-dark': '#00838F',
        'ocean-text-dark': '#1A334B',
        'ocean-text-light': '#4A7C9A',
        'ocean-accent-gold': '#FFD700',
        'ocean-accent-red': '#EF5350',
        'glass-light-bg': 'rgba(255, 255, 255, 0.7)',
        'glass-light-border': 'rgba(255, 255, 255, 0.9)',
        'gradient-start': '#A8DADC',
        'gradient-end': '#4DB6AC',
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        heading: ['"Montserrat"', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(180deg, #EBF7FF 0%, #D6EEFF 50%, #A8DADC 100%)',
        'gradient-hero': 'linear-gradient(225deg, #D6EEFF 0%, #A8DADC 100%)',
      },
      boxShadow: {
        'glass-card-shadow': '0 10px 40px rgba(0, 0, 0, 0.05), inset 0 0 10px rgba(255, 255, 255, 0.8)',
        'button-glow': '0 0 15px rgba(77, 182, 172, 0.4)',
      },
      keyframes: {
        'fade-in-up': { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'scale-in': { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        'bubble-float-light': { '0%': { transform: 'translate(calc(-50% + var(--rand-x)), 0vh) scale(0)', opacity: '0' }, '20%': { opacity: '0.6', transform: 'translate(calc(-50% + var(--rand-x)), -20vh) scale(0.8)' }, '100%': { transform: 'translate(calc(-50% + var(--rand-x)), -100vh) scale(1.1)', opacity: '0' } },
        'caustic-shimmer': { '0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: '0.1' }, '50%': { transform: 'scale(1.05) rotate(2deg)', opacity: '0.15' } },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
        'scale-in': 'scale-in 0.5s ease-out forwards',
        'bubble-float-1': 'bubble-float-light 10s ease-out infinite 0s',
        'bubble-float-2': 'bubble-float-light 12s ease-out infinite 2s',
        'bubble-float-3': 'bubble-float-light 8s ease-out infinite 4s',
        'bubble-float-4': 'bubble-float-light 11s ease-out infinite 6s',
        'caustic-shimmer': 'caustic-shimmer 25s ease-in-out infinite alternate',
      }
    },
  },
  plugins: [],
};