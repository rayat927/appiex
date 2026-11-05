module.exports = {
  content: ['./*.html', './blog/**/*.html', './pages/**/*.html', './authors/**/*.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        appiexRed: '#FF2A4D',
        appiexRedDark: '#DC2626',
        appiexTeal: '#2DD4BF',
        appiexDark: '#030408',
        appiexCard: '#080910'
      },
      fontFamily: {
        sans: ['Google Sans', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        montserrat: ['Montserrat', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        oswald: ['Oswald', 'sans-serif']
      }
    }
  },
  plugins: []
};
