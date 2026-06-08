import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0a0d10',
        panel: '#11161c',
        panel2: '#151b21',
        line: '#26303a',
        amber: {
          50: '#fff6e8',
          100: '#ffe8c2',
          200: '#ffd38a',
          300: '#ffbe57',
          400: '#f9a93a',
          500: '#e48a1e',
          600: '#be6717',
          700: '#934e16',
        },
        trust: '#4fd0b0',
        hostile: '#ff6f61',
        muted: '#7d8894',
      },
      boxShadow: {
        soft: '0 0 0 1px rgba(255,255,255,0.04), 0 18px 50px rgba(0,0,0,0.32)',
        amber: '0 0 0 1px rgba(249,169,58,0.25), 0 0 28px rgba(249,169,58,0.12)',
      },
      backgroundImage: {
        'grid-fine':
          'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
        'ambient':
          'radial-gradient(circle at top left, rgba(249,169,58,0.14), transparent 30%), radial-gradient(circle at 75% 10%, rgba(79,208,176,0.10), transparent 20%), radial-gradient(circle at 80% 80%, rgba(255,111,97,0.08), transparent 22%)',
      },
      keyframes: {
        pulseSoft: {
          '0%, 100%': { opacity: '0.68' },
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
