/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        terracotta: {
          50: '#FDF6F3',
          100: '#FAECE6',
          200: '#F4D6CA',
          300: '#EBBBA9',
          400: '#DD9579',
          500: '#C85A32', // Primary
          600: '#B64C26',
          700: '#983C1B',
          800: '#7A3219',
          900: '#642B18',
        },
        cream: {
          50: '#FCFAF7',
          100: '#F8F4EE',
          200: '#F0E7DB', // Secondary
          300: '#E5D6C3',
          400: '#D6C0A6',
          500: '#C4A684',
        },
        olive: {
          50: '#F4F7F2',
          100: '#E6ECE0',
          200: '#CDDBC4',
          300: '#AFC5A2',
          400: '#8AA979',
          500: '#5A784B', // Accent
          600: '#48633B',
          700: '#3A5030',
          800: '#304229',
          900: '#293724',
        },
        ivory: '#FDFCFA',
        charcoal: {
          900: '#1C1E1B',
          800: '#292B28',
          700: '#41443F',
          600: '#5F635D',
          500: '#80857D',
          400: '#A6ABA2',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      }
    },
  },
  plugins: [],
}
