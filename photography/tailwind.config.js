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
        darkroom: '#181410',
        panel:    '#221E1A',
        copper:   '#B8743E',
        ink:      '#2C1F14',
        edge:     '#DDD0BE',
        mist:     '#9A8878',
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
