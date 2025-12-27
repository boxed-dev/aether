/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          // Softer dark palette - not pure black
          dark: '#121212',
          gray: '#1e1e1e',
          surface: '#262626',
          border: '#3a3a3a',
          // Softer accent - not neon
          accent: '#6366f1',
          'accent-hover': '#818cf8',
          'accent-muted': '#4f46e5',
          // Secondary accent
          success: '#22c55e',
          'success-muted': '#16a34a',
          // Text colors - not pure white
          text: '#f5f5f5',
          'text-secondary': '#a3a3a3',
          muted: '#737373',
        },
        // Glass effect colors
        glass: {
          bg: 'rgba(30, 30, 30, 0.8)',
          border: 'rgba(255, 255, 255, 0.1)',
          highlight: 'rgba(255, 255, 255, 0.15)',
          text: '#f5f5f5',
          subtext: '#a3a3a3',
        },
        // Accent colors for buttons
        accent: {
          blue: '#6366f1',
          hover: '#818cf8',
        },
      },
      backdropBlur: {
        glass: '20px',
      },
      boxShadow: {
        glass: '0 4px 24px -1px rgba(0, 0, 0, 0.3)',
        'glass-hover': '0 8px 32px -4px rgba(99, 102, 241, 0.15)',
        'glass-card': '0 4px 24px -1px rgba(0, 0, 0, 0.2)',
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.3)',
        'medium': '0 4px 16px -4px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
};