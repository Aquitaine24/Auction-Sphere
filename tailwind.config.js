/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./pages/**/*.{html,js}",
    "./components/**/*.{html,js}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#8C3CED",
        secondary: "#28134a",
        highlight: "#3b2461",
        navBar: "#2c2636",
      },
    },
  },
  plugins: [],
};
