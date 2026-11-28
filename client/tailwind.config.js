/** @type {import('tailwindcss').Config} */
import typography from "@tailwindcss/typography";
export default {
  darkMode: "class", // Enable class-based dark mode
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"], // Adjust based on your project structure
  theme: {
    extend: {
      maxWidth: {
        "8xl": "90rem",
      },
      animation: {
        spin: "spin 1.2s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" }, // only 50% because you're duplicating the items
        },
      },
      colors: {
        // Brand rule: never darker than primary-500. 600–900 alias 500 so
        // legacy classes (hover:bg-primary-600, bg-primary-700, etc.) stay capped.
        primary: {
          DEFAULT: "#FFA602",
          50: "#FFF8E6",
          100: "#FFECB3",
          200: "#FFDF80",
          300: "#FFD24D",
          400: "#FFC51A",
          500: "#FFA602",
          600: "#FFA602",
          700: "#FFA602",
          800: "#FFA602",
          900: "#FFA602",
        },
      },
    },
  },
  plugins: [
    typography, // Add the typography plugin
  ],
};
