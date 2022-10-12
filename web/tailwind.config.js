/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      container: {
        padding: "2rem",
      },
      colors: {
        primary: "#161BF6",
        accent: "#FFD300",
      },
      fontFamily: {
        primary: "Inter, sans-serif",
      },
      borderWidth: {
        1: "0.1em",
        1.5: "0.15em",
      },
      transitionDuration: {
        400: "400ms",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.19, 1, 0.22, 1)",
      },
      spacing: {
        0.5: "0.1rem",
        1.5: "0.35rem",
        18: "4.5rem",
        "9/10": "90%",
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/line-clamp"),
  ],
};
