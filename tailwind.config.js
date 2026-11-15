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
        cafe: {
          dark: '#0f1217',
          surface: '#151a23',
          card: '#1a202c',
          cardHover: '#212938',
          border: '#2a3447',
          borderLight: '#374359',
          orange: '#ea580c',
          orangeHover: '#f97316',
          orangeLight: '#ffedd5',
          green: '#10b981',
          greenDark: '#059669',
          amber: '#f59e0b',
          blue: '#3b82f6',
          purple: '#8b5cf6'
        }
      },
      fontFamily: {
        mono: ['Courier New', 'Courier', 'monospace', 'ui-monospace'],
      }
    },
  },
  plugins: [],
}
