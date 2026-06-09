import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0b0b0b',
        panel: '#171717',
        panel2: '#1a1a1a',
        line: '#252525',
        amber: {
          50: '#fff7ea',
          100: '#f8e4b9',
          200: '#e8c87f',
          300: '#d7a84b',
          400: '#c98f33',
          500: '#ab7227',
          600: '#8e5921',
          700: '#6f461c',
        },
        trust: '#36b37e',
        hostile: '#d95c59',
        muted: '#8c8c8c',
        primary: '#1f5fd1',
      },
      boxShadow: {
        soft: '0 0 0 1px rgba(255,255,255,0.04), 0 12px 34px rgba(0,0,0,0.24)',
        amber: '0 0 0 1px rgba(215,168,75,0.18), 0 0 20px rgba(215,168,75,0.08)',
      },
      backgroundImage: {
        'grid-fine':
          'linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px)',
        ambient:
          'radial-gradient(circle at top left, rgba(31,95,209,0.06), transparent 28%), radial-gradient(circle at 78% 12%, rgba(54,179,126,0.05), transparent 20%)',
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { opacity: '0.72' },
          '50%': { opacity: '1' },
        },
        sweep: {
          '0%': { transform: 'translateX(-40%)' },
          '100%': { transform: 'translateX(140%)' },
        },
        drift: {
          '0%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-3px,0)' },
          '100%': { transform: 'translate3d(0,0,0)' },
        },
      },
      animation: {
        pulseSoft: 'pulseSoft 2.8s ease-in-out infinite',
        sweep: 'sweep 2.2s linear infinite',
        drift: 'drift 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
