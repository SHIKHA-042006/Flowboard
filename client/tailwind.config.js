/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#16202C', soft: '#475467', faint: '#8A94A6' },
        surface: '#EEF1F5',
        panel: '#FFFFFF',
        line: '#DFE4EC',
        accent: { DEFAULT: '#0E7C6B', hover: '#0B6153', soft: '#E3F2EF' },
        danger: { DEFAULT: '#C0392B', soft: '#FDECEA' },
        warn: { DEFAULT: '#B45309', soft: '#FCF1DF' },
        // Dark-mode surfaces, referenced via dark: variants throughout the app.
        dink: { DEFAULT: '#E7ECF3', soft: '#AEB8C9', faint: '#7E899C' },
        dsurface: '#0E1520',
        dpanel: '#161F2E',
        dline: '#26324590',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(22,32,44,.10), 0 1px 1px rgba(22,32,44,.04)',
        lift: '0 12px 28px rgba(22,32,44,.18)',
        panel: '0 24px 60px rgba(22,32,44,.22)',
      },
      borderRadius: { xl2: '14px' },
    },
  },
  plugins: [],
};
