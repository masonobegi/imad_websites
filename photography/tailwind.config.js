/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas:   '#F5F0E8',
        darkroom: '#3A2E26',
        copper:   '#C17F52',
        ink:      '#2C1F14',
        edge:     '#DDD0BE',
        shadow:   '#4A3728',
      },
      fontFamily: {
        serif: ['"Merriweather"', 'Georgia', 'serif'],
        sans:  ['"Open Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
