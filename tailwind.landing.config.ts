import type { Config } from 'tailwindcss'

/**
 * Tailwind config for the static marketing landing (landing-source.html, served by app/route.ts).
 * Compiled at build time into public/landing.css so the page no longer needs the
 * runtime Tailwind CDN (render-blocking JIT + 'unsafe-eval' in the CSP).
 * The theme mirrors the former inline `tailwind.config` from the HTML head.
 */
const config: Config = {
  content: ['./landing-source.html', './public/cookie-consent.js', './public/discount-popup.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
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
        accent: {
          blue: '#5899E2',
          lightblue: '#E0EDF8',
          purple: '#335C81',
          navy: '#1B2845',
        },
      },
    },
  },
  plugins: [],
}

export default config
