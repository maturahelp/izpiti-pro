import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B4FD8',
          dark: '#1337B5',
          light: '#EEF2FF',
        },
        amber: {
          DEFAULT: '#B45309',
          light: '#FEF3C7',
        },
        surface: '#FFFFFF',
        bg: '#F8FAFC',
        border: '#E2E8F0',
        text: {
          DEFAULT: '#0F172A',
          muted: '#475569',
          light: '#94A3B8',
        },
        sidebar: '#0B1120',
        'sidebar-hover': '#141D2E',
        success: '#059669',
        'success-light': '#ECFDF5',
        danger: '#DC2626',
        'danger-light': '#FEF2F2',
        warning: '#B45309',
        'warning-light': '#FEF3C7',
      },
      fontFamily: {
        serif: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.04), 0 0 0 1px rgba(15,23,42,0.03)',
        'card-hover': '0 8px 24px rgba(15,23,42,0.08), 0 2px 4px rgba(15,23,42,0.04), 0 0 0 1px rgba(15,23,42,0.04)',
        modal: '0 24px 64px rgba(15,23,42,0.12), 0 4px 8px rgba(15,23,42,0.04)',
        'button-primary': '0 1px 2px rgba(27,79,216,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
        'button-primary-hover': '0 4px 12px rgba(27,79,216,0.3)',
      },
    },
  },
  plugins: [],
}

export default config
