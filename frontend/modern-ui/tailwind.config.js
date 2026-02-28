/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8ff',
          100: '#d9efff',
          500: '#1592c6',
          700: '#0f6f8f',
          900: '#0b3550'
        }
      }
    }
  },
  plugins: []
};

