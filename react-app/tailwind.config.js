/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        fadeIn: "fadeIn 0.3s ease-out",
      },
      typography: {
        DEFAULT: {
          css: {
            strong: {
              fontWeight: "700",
              color: "#374151",
            },
            ul: {
              listStyleType: "disc",
              paddingLeft: "1.5rem",
              marginTop: "0.5rem",
              marginBottom: "0.5rem",
            },
            li: {
              marginTop: "0.25rem",
              marginBottom: "0.25rem",
            },
            "ul > li": {
              marginTop: "0.25em",
              marginBottom: "0.25em",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
