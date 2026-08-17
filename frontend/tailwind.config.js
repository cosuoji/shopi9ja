/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        luxury: {
          black: '#0D0D0D',
          charcoal: '#1A1A1A',
          cream: '#FBF9F5',
          gold: '#D4B886',        /* Slightly brighter gold for better legibility */
          'gold-hover': '#C5A880',
          gray: '#2A2A2A',
          muted: '#A3A3A3',       /* Bumped up from #8E8E8E for much clearer readability */
          border: '#404040',      /* Bumped up from #333333 so container edges are visible */
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Didot', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.25em',
        editorial: '0.15em',
      },
    },
  },
  plugins: [],
};
