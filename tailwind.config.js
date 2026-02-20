/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          800: '#1e3a5f',
          900: '#0f172a',
        },
      },
    },
  },
  plugins: [],
};
