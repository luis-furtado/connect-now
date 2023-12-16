/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        lg: { max: "1060px", min: "670px" },
        md: { max: "670px" },
      },
    },
  },
  plugins: [],
};
