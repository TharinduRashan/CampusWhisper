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
        // Dynamic Surface / background (RGB format supports /80 opacity modifiers)
        surface: {
          DEFAULT: 'rgb(var(--bg-surface-rgb) / <alpha-value>)',
          50:  'rgb(var(--bg-card-rgb) / <alpha-value>)',
        },
        // Dynamic Card surfaces
        card: {
          DEFAULT: 'rgb(var(--bg-card-rgb) / <alpha-value>)',
          hover:   'var(--bg-card-hover)',
          border:  'var(--border-card)',
        },
        // Dynamic Text hierarchy
        ink: {
          DEFAULT: 'rgb(var(--text-ink-rgb) / <alpha-value>)',
          muted:   'var(--text-ink-muted)',
          subtle:  'var(--text-ink-subtle)',
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
        'card':       '0 4px 24px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'fade-in':      'fadeIn 0.3s ease-in-out',
        'slide-up':     'slideUp 0.3s ease-out',
        'slide-down':   'slideDown 0.2s ease-out',
        'scale-in':     'scaleIn 0.2s ease-out',
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
      },
    },
  },
  plugins: [],
}

export default config
