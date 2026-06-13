/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream:  '#FAF7F2',
        warm:   '#F0E8DC',
        ink:    '#2C1A0E',
        muted:  '#9A7A5A',
        rule:   '#DDD0BE',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['Lato', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
