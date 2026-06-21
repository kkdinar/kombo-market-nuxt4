/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/components/**/*.{js,vue,ts}",
    "./app/layouts/**/*.vue",
    "./app/pages/**/*.vue",
    "./app/plugins/**/*.{js,ts}",
    "./app/app.vue",
    "./app/error.vue",
  ],
  theme: {
    extend: {
      colors: {
        'khaki-dark': '#2D3419',
        'khaki-mid': '#4A5D23',
        'neon-lemon': '#DFFF00',
        'milk-white': '#fcfdf7'
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(223, 255, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
