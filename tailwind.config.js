/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Newsreader', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
      colors: {
        paper: {
          50: '#FDFCF8',
          100: '#FBF9F4',
          150: '#F7F4EC',
          200: '#F0ECE1',
          300: '#E2DDCF',
          400: '#C5BEAD',
          500: '#9E9684',
          600: '#6E6756',
          700: '#4A453A',
          800: '#2C2923',
          900: '#181613',
        },
        ink: {
          950: '#0B0C0E',
          900: '#121316',
          850: '#17181D',
          800: '#1E2026',
          700: '#2A2C35',
          600: '#3D414E',
          500: '#5C6274',
          400: '#8A92A6',
          300: '#B6BDCF',
          200: '#DDE2ED',
          100: '#F1F3F9',
        },
        atelier: {
          amber: '#B8860B',
          sepia: '#704214',
          terracotta: '#A0522D',
          olive: '#556B2F',
          slate: '#475569',
        }
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0,0,0,0.03), 0 1px 2px rgba(0,0,0,0.02)',
        'elevated': '0 8px 30px rgba(0,0,0,0.06)',
        'dark-elevated': '0 8px 30px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
