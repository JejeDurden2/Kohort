/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      backgroundImage: {
        kohortpay: "url('/images/backgrounds/header.png')",
      },
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        white: '#FFFFFF',
        black: '#170D2C',
        primary: '#ED395E',
        secondary: '#C62344',
        grey: {
          DEFAULT: '#6B7280',
          medium: '#F2F2F2',
          light: '#E5E7EB',
          lighter: '#F9F6F6',
          pink: '#FFF6F7',
        },
        beige: {
          DEFAULT: '#FDFBF9',
          strong: '#F8F1EC',
        },
        orange: '#F1511F',
        green: '#12BB3E',
        red: '#dc2626',
        // ---- TO REMOVE
        brand: {
          50: '#FDFBF9',
          60: '#F8F1EC',
          75: '#F7A6B8',
          100: '#ED395E',
          150: '#EB1E48',
          200: '#EB6340',
          250: '#EC552F',
          600: '#725E4F',
          900: '#170D2C',
        },
        // ---- TO REMOVE
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
