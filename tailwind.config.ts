import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand — deep violet
        primary: {
          50:  '#f3f0ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        // Surface / background (dark-mode first)
        surface: {
          DEFAULT: '#0f0f14',
          50:  '#1a1a24',
          100: '#16161f',
          200: '#12121a',
          300: '#0f0f14',
          400: '#0b0b10',
        },
        // Card surfaces
        card: {
          DEFAULT: '#1a1a24',
          hover:   '#1f1f2e',
          border:  '#2a2a3a',
        },
        // Text hierarchy
        ink: {
          DEFAULT: '#e2e2f0',
          muted:   '#9191a8',
          subtle:  '#5c5c72',
        },
        // Category accent colors
        category: {
          gossip:      '#ec4899',
          confessions: '#f59e0b',
          memes:       '#10b981',
          questions:   '#3b82f6',
          relationships:'#f43f5e',
          news:        '#8b5cf6',
          clubs:       '#06b6d4',
          events:      '#f97316',
          lost:        '#6366f1',
          marketplace: '#84cc16',
          rants:       '#ef4444',
        },
        // Voting
        upvote:   '#22c55e',
        downvote: '#ef4444',
      },
      fontFamily: {
        sans:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'glow':       '0 0 20px rgba(124, 58, 237, 0.25)',
        'glow-sm':    '0 0 10px rgba(124, 58, 237, 0.15)',
        'card':       '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'fade-in':      'fadeIn 0.3s ease-in-out',
        'slide-up':     'slideUp 0.3s ease-out',
        'slide-down':   'slideDown 0.2s ease-out',
        'scale-in':     'scaleIn 0.2s ease-out',
        'pulse-glow':   'pulseGlow 2s ease-in-out infinite',
        'shimmer':      'shimmer 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124, 58, 237, 0.25)' },
          '50%':       { boxShadow: '0 0 40px rgba(124, 58, 237, 0.5)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
      },
      screens: {
        xs: '375px',
      },
    },
  },
  plugins: [],
}

export default config
