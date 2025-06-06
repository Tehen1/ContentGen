/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6C5CE7',
          50: '#F0EEFB',
          100: '#DCD8F7',
          200: '#B5ACF0',
          300: '#8D80E8',
          400: '#6C5CE7', // Primary color
          500: '#4A38E0',
          600: '#3521C8',
          700: '#291A99',
          800: '#1D136B',
          900: '#120C3D',
        },
        secondary: {
          DEFAULT: '#00B894',
          50: '#E0FBF6',
          100: '#B3F5E6',
          200: '#80EED6',
          300: '#4DE7C6',
          400: '#1AE0B6',
          500: '#00B894', // Secondary color
          600: '#00997A',
          700: '#007A60',
          800: '#005C48',
          900: '#003D30',
        },
        accent: {
          DEFAULT: '#FD7272',
          50: '#FFEFEF',
          100: '#FFCFCF',
          200: '#FFA8A8',
          300: '#FE8686',
          400: '#FD7272', // Accent color
          500: '#FC4E4E',
          600: '#FB2A2A',
          700: '#F20707',
          800: '#BE0505',
          900: '#8A0404',
        },
        dark: {
          DEFAULT: '#1E1E2A',
          50: '#F7F7F9',
          100: '#E1E1E6',
          200: '#C4C4D0',
          300: '#A6A6B9',
          400: '#8989A3',
          500: '#6C6C8C',
          600: '#515171',
          700: '#3D3D54',
          800: '#282836',
          900: '#1E1E2A', // Dark background
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 0 0 1px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 0 0 1px rgba(0, 0, 0, 0.05), 0 3px 6px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
