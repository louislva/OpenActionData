/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      minHeight: {
        "screen-lead": "calc(100vh - 8rem)",
      },
    },
    fontFamily: {
      /* cabin, kelly slab, inter, roboto, dosis, and for the titles we have montserrat */
      cabin: ["Cabin", "sans-serif"],
      dosis: ["Dosis", "sans-serif"],

      // roboto: ['Roboto', 'sans-serif'],
      // inter: ['Inter', 'sans-serif'],
      // montserrat: ['Montserrat', 'sans-serif'],
      // kellyslab: ['Kelly Slab', 'sans-serif'],
    },
  },
  plugins: [],
};
