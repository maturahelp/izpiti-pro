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
          dark: '#1540B8',
          light: '#EEF2FF',
        },
        amber: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
        },
        surface: '#FFFFFF',
        bg: '#F4F6FA',
        border: '#E4E7EC',
        text: {
          DEFAULT: '#111827',
          muted: '#6B7280',
          light: '#9CA3AF',
        },
        sidebar: '#0F172A',
        'sidebar-hover': '#1E293B',
        success: '#16A34A',
        'success-light': '#DCFCE7',
        danger: '#DC2626',
        'danger-light': '#FEE2E2',
        warning: '#D97706',
        'warning-light': '#FEF3C7',
      },
      fontFamily: {
        serif: ['var(--font-lora)', 'Georgia', 'serif'],
        sans: ['var(--font-plus-jakarta)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.08), 0 2px 4px -2px rgba(0,0,0,0.04)',
        modal: '0 20px 60px 0 rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}

export default config
