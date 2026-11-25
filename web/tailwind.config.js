/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['"Lora"', 'Georgia', 'serif'],
      },
      colors: {
        heritage: {
          cream: '#FAF7F2',
          paper: '#F5EFE6',
          sand: '#E7E0D4',
          vermilion: '#B91C1C',
          'vermilion-dark': '#991B1B',
          'vermilion-soft': '#FEF2F2',
          gold: '#C88A1E',
          'gold-soft': '#FBF3E0',
          jade: '#0F766E',
          'jade-soft': '#CCFBF1',
          ink: '#1C1917',
          muted: '#57534E',
          border: '#E7E5E4',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(28, 25, 23, 0.06), 0 6px 20px rgba(28, 25, 23, 0.04)',
        'card-hover': '0 10px 30px rgba(28, 25, 23, 0.10), 0 2px 8px rgba(28, 25, 23, 0.05)',
      },
    },
  },
  plugins: [],
};
