/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        accent: {
          50:  "#ecfeff",
          100: "#cffafe",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
        },
        dark: {
          bg:      "#0a0f1e",
          surface: "#0f1629",
          card:    "#141d35",
          border:  "#1e2a45",
        },
      },
      backgroundImage: {
        "gradient-hero": "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
        "gradient-card": "linear-gradient(135deg, rgba(79,70,229,0.15) 0%, rgba(6,182,212,0.08) 100%)",
      },
      fontFamily: {
        display: ["var(--font-syne)", "sans-serif"],
        body:    ["var(--font-inter)", "sans-serif"],
        code:    ["var(--font-fira)", "monospace"],
      },
      animation: {
        "float":    "float 6s ease-in-out infinite",
        "spin-slow":"spin 20s linear infinite",
        "pulse-dot":"pulseDot 2s ease-in-out infinite",
        "blink":    "blink 1s step-end infinite",
        "fade-in":  "fadeIn 0.4s ease forwards",
      },
    },
  },
  plugins: [],
};
