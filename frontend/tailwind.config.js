/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#09090b', // Zinc 950
        surface: '#18181b', // Zinc 900
        surfaceHover: '#27272a', // Zinc 800
        border: '#27272a', // Zinc 800
        primary: '#6d28d9', // Violet 700 (Linear style accent)
        primaryHover: '#5b21b6', // Violet 800
        textMain: '#f4f4f5', // Zinc 100
        textMuted: '#a1a1aa', // Zinc 400
        accent: '#3b82f6', // Blue 500 for secondary accents
        danger: '#ef4444',
        success: '#22c55e',
        warning: '#f59e0b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(109, 40, 217, 0.15)',
        'premium': '0 4px 20px rgba(0,0,0,0.4)',
      }
    },
  },
  plugins: [],
}
