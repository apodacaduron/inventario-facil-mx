/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

export default {
  mode: 'jit',
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    './node_modules/@flavorly/vanilla-components/dist/presets/tailwind/all.json', 
  ],
  theme: {
    extend: {
      colors: {
        primary: colors.blue, 
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'), 
  ],
}

