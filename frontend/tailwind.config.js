/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        ocean: '#0f766e',
        coral: '#f97316',
        saffron: '#f59e0b',
        berry: '#be123c',
        mint: '#ecfdf5'
      },
      boxShadow: {
        soft: '0 18px 60px rgba(15, 23, 42, 0.12)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
