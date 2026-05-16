export default {
  darkMode: ["class"],
  theme: {
    extend: {
      keyframes: {
        'clear-whiteout': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        typing: {
          from: { width: '0' },
          to: { width: '100%' },
        },
        'blink-caret': {
          '0%, 100%': { 'border-right-color': 'transparent' },
          '50%': { 'border-right-color': 'rgba(223,240,255,0.75)' },
        },
        'fade-in-text': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'clear-whiteout': 'clear-whiteout 1.5s ease-out forwards',
        typing: 'typing 1s steps(40,end) forwards',
        'blink-caret': 'blink-caret 650ms ease-in-out infinite',
        'fade-in-text': 'fade-in-text 320ms ease-out both',
      },
    },
    fontFamily: {
      heading: ["Sora", "sans-serif"],
      body: ["Inter", "sans-serif"],
    }
  },
  plugins: [],
}