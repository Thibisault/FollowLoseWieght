/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'SF Pro Display', 'Inter', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial']
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.06), 0 18px 50px rgba(0,0,0,0.6)'
      }
    },
  },
  plugins: [],
}
