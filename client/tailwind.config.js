/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        cream: 'rgb(var(--cream) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        saffron: {
          DEFAULT: 'rgb(var(--saffron) / <alpha-value>)',
          dark: 'rgb(var(--saffron-dark) / <alpha-value>)',
        },
        gold: 'rgb(var(--gold) / <alpha-value>)',
        plum: {
          DEFAULT: 'rgb(var(--plum) / <alpha-value>)',
          light: 'rgb(var(--plum-light) / <alpha-value>)',
        },
        teal: 'rgb(var(--teal) / <alpha-value>)',
        rose: 'rgb(var(--rose) / <alpha-value>)',
        whatsapp: '#25D366',
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      borderRadius: { card: '14px', tile: '12px' },
      boxShadow: {
        soft: '0 1px 2px rgba(36,27,46,0.04), 0 8px 24px rgba(36,27,46,0.06)',
        lift: '0 4px 12px rgba(36,27,46,0.08), 0 16px 40px rgba(36,27,46,0.10)',
      },
      maxWidth: { content: '1120px' },
      spacing: { 13: '3.25rem' },
    },
  },
  plugins: [],
};
