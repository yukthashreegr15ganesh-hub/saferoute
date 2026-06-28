/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#050A0F',
        card: '#0B1219',
        primary: '#00FFB2',
        danger: '#FF4757',
        warning: '#FFA502',
        safe: '#2ED573',
        textMain: '#FFFFFF',
        textMuted: '#7A8FA6',
        night: '#1A0508',
      },
      fontFamily: {
        heading: ['Orbitron', 'Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 255, 178, 0.35)',
        'glow-sm': '0 0 12px rgba(0, 255, 178, 0.25)',
        danger: '0 0 24px rgba(255, 71, 87, 0.5)',
      },
      animation: {
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
        'radar-sweep': 'radar-sweep 3s linear infinite',
        'sonar': 'sonar 2s ease-out infinite',
        shimmer: 'shimmer 1.5s infinite',
        'hex-pulse': 'hex-pulse 4s ease-in-out infinite',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.06)', opacity: '0.85' },
        },
        'radar-sweep': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        sonar: {
          '0%': { transform: 'scale(0.5)', opacity: '0.8' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'hex-pulse': {
          '0%, 100%': { opacity: '0.03' },
          '50%': { opacity: '0.08' },
        },
      },
    },
  },
  plugins: [],
};
