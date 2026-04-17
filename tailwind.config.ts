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
          DEFAULT: '#3b82f6',
          dark: '#2563eb',
          light: '#EFF6FF',
          lighter: '#F0F7FF',
        },
        navy: { DEFAULT: '#1e2a4a' },
        amber: {
          DEFAULT: '#B45309',
          light: '#FEF3C7',
        },
        surface: '#FFFFFF',
        bg: '#F5F8FF',
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
        serif: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.75rem',
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '2.5rem',
      },
      boxShadow: {
        card: '0 4px 20px rgba(0,0,0,0.06)',
        'card-hover': '0 12px 32px rgba(15,23,42,0.10), 0 2px 4px rgba(15,23,42,0.04)',
        modal: '0 24px 64px rgba(15,23,42,0.12), 0 4px 8px rgba(15,23,42,0.04)',
        'button-primary': '0 2px 8px rgba(59,130,246,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
        'button-primary-hover': '0 8px 20px rgba(59,130,246,0.35)',
        soft: '0 4px 20px rgba(0,0,0,0.06)',
        'soft-lg': '0 8px 30px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}

export default config
