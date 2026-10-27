/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#070A12',
          surface: '#111B2E',
          subsurface: '#0D1322',
          cyan: '#35F2FF',
          magenta: '#FF3DF2',
          green: '#A3FF12',
          amber: '#FFC857',
          red: '#FF4D6D',
          text: '#EAF2FF',
          muted: '#8EA3BD',
          border: 'rgba(53, 242, 255, 0.15)',
          'border-active': 'rgba(53, 242, 255, 0.5)',
        }
      },
      fontFamily: {
        mono: ['"Fira Code"', 'Consolas', 'monospace'],
        display: ['Rajdhani', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(53, 242, 255, 0.35)',
        'neon-cyan-lg': '0 0 30px rgba(53, 242, 255, 0.5)',
        'neon-magenta': '0 0 15px rgba(255, 61, 242, 0.35)',
        'neon-green': '0 0 15px rgba(163, 255, 18, 0.35)',
        'terminal': 'inset 0 0 20px rgba(7, 10, 18, 0.8), 0 0 20px rgba(53, 242, 255, 0.1)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.5s infinite ease-in-out',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.9' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        }
      }
    },
  },
  plugins: [],
}
