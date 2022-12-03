const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./public/*", "./src/*"],
    theme: {
        extend: {
            height: {
                "18": "4.5rem",
            }
        },
        fontFamily: {
            sans: ["Raleway", ...defaultTheme.fontFamily.sans],
            mono: ["Kelly Slab", ...defaultTheme.fontFamily.mono],
        },
    },
    plugins: [],
};
