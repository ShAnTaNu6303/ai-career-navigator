/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      colors: {
        bg: '#0a0f1e',
        card: '#0e1628',
        border: '#1a2a4a',
        accent: '#00d4ff',
        accent2: '#7c3aed',
        accent3: '#10b981',
        accent4: '#f59e0b',
      },
      animation: {
        'slide-in': 'slideIn 0.4s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        slideIn: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
      }
    }
  },
  plugins: []
}
