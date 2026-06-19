/** @type {import('tailwindcss').Config} */

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,vue}'],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        ink: '#0E3B3A',
        'ink-soft': '#2A4A48',
        gold: '#B8893A',
        'gold-soft': '#D9B474',
        paper: '#F6F1E9',
        'paper-2': '#EFE7D8',
        line: '#E2D9C8',
        muted: '#6B7670',
        danger: '#B4451F',
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(14,59,58,0.04), 0 24px 60px -28px rgba(14,59,58,0.22)',
        inset: 'inset 0 1px 2px rgba(14,59,58,0.04)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pop: {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '60%': { opacity: '1', transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        rise: 'rise 0.6s cubic-bezier(0.16,1,0.3,1) both',
        pop: 'pop 0.5s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
}
