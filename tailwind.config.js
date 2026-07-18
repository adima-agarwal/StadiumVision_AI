/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'stadium-navy': '#0B0F19',
        'charcoal-blue': '#161F30',
        'slate-navy': '#24334C',
        'pitch-green': '#00E676',
        'alert-orange': '#FF3D00',
        'warning-amber': '#FFD600',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-in': 'slideIn 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scan-line': 'scanLine 3s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 230, 118, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 230, 118, 0.6), 0 0 40px rgba(0, 230, 118, 0.2)' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'green-glow': '0 0 20px rgba(0, 230, 118, 0.15)',
        'green-glow-lg': '0 0 40px rgba(0, 230, 118, 0.25)',
        'orange-glow': '0 0 20px rgba(255, 61, 0, 0.2)',
        'panel': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
    },
  },
  plugins: [],
}
