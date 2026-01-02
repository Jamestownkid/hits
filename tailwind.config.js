/** @type {import('tailwindcss').Config} */
// tailwind config - hits uses a dark cyberpunk theme cause were edgy like that
export default {
  content: ['./src/renderer/**/*.{js,ts,jsx,tsx,html}'],
  theme: {
    extend: {
      colors: {
        hits: {
          bg: '#0a0a0f',
          surface: '#12121a',
          border: '#1e1e2e',
          accent: '#6366f1',
          'accent-bright': '#818cf8',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
          text: '#e2e8f0',
          muted: '#64748b',
        },
      },
      fontFamily: {
        sans: ['JetBrains Mono', 'monospace'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #6366f1, 0 0 10px #6366f1' },
          '100%': { boxShadow: '0 0 20px #6366f1, 0 0 40px #6366f1' },
        },
      },
    },
  },
  plugins: [],
}

