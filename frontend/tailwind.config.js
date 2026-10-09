/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        grameena: {
          50: '#f1f8f3',
          100: '#ddece3',
          200: '#bcd9c9',
          300: '#90bfab',
          400: '#649f87',
          500: '#458369',
          600: '#336852',
          700: '#2a5444',
          800: '#234438',
          900: '#1e382f',
          950: '#0e1f19',
        },
        earth: {
          50: '#f8f6f3',
          100: '#efece6',
          200: '#dbd4c6',
          300: '#c2b6a0',
          400: '#aa9678',
          500: '#998160',
          600: '#8c7053',
          700: '#755b46',
          800: '#614d3e',
          900: '#4f3f34',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
