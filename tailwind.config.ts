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
          DEFAULT: '#5899E2',
          dark: '#335C81',
          light: '#EBF3FB',
          50: '#F0F6FC',
          100: '#E0EDF8',
          200: '#C5DDF1',
          300: '#9AC2E8',
          400: '#5899E2',
          500: '#5899E2',
          600: '#335C81',
          700: '#274060',
          800: '#1B2845',
          900: '#12192E',
        },
        indigo: {
          50: '#F0F6FC',
          100: '#E0EDF8',
          200: '#C5DDF1',
          300: '#9AC2E8',
          400: '#5899E2',
          500: '#335C81',
          600: '#274060',
          700: '#1B2845',
          800: '#12192E',
          900: '#0A0F1E',
        },
        accent: {
          blue: '#5899E2',
          lightblue: '#E0EDF8',
          purple: '#335C81',
          indigo: '#274060',
          navy: '#1B2845',
        },
        amber: {
          DEFAULT: '#B45309',
          light: '#FEF3C7',
        },
        surface: '#FFFFFF',
        bg: '#F8FAFC',
        border: '#E2E8F0',
        text: {
          DEFAULT: '#1B2845',
          muted: '#64748B',
          light: '#94A3B8',
        },
        sidebar: '#1B2845',
        'sidebar-hover': '#274060',
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
        card: '0 4px 20px rgba(27,40,69,0.06)',
        'card-hover': '0 8px 30px rgba(27,40,69,0.08)',
        modal: '0 24px 64px rgba(27,40,69,0.12), 0 4px 8px rgba(27,40,69,0.04)',
        'button-primary': '0 1px 2px rgba(88,153,226,0.25)',
        'button-primary-hover': '0 4px 12px rgba(88,153,226,0.35)',
      },
    },
  },
  plugins: [],
}

export default config
