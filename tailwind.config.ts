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
          light: '#eff6ff',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        accent: {
          blue: '#3b82f6',
          lightblue: '#dbeafe',
          purple: '#8b5cf6',
          indigo: '#6366f1',
          navy: '#1e2a4a',
        },
        amber: {
          DEFAULT: '#B45309',
          light: '#FEF3C7',
        },
        surface: '#FFFFFF',
        bg: '#F8FAFC',
        border: '#E2E8F0',
        text: {
          DEFAULT: '#1e2a4a',
          muted: '#64748B',
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
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        card: '0 4px 20px rgba(15,23,42,0.06)',
        'card-hover': '0 8px 30px rgba(15,23,42,0.08)',
        modal: '0 24px 64px rgba(15,23,42,0.12), 0 4px 8px rgba(15,23,42,0.04)',
        'button-primary': '0 1px 2px rgba(59,130,246,0.2)',
        'button-primary-hover': '0 4px 12px rgba(59,130,246,0.3)',
      },
    },
  },
  plugins: [],
}

export default config
