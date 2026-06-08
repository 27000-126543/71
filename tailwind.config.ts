import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#E6ECF5",
          100: "#C3D0E5",
          200: "#8FA6C9",
          300: "#5A7CAC",
          400: "#2E5290",
          500: "#0B2545",
          600: "#091E38",
          700: "#07162A",
          800: "#050F1C",
          900: "#03080E",
        },
        gold: {
          50: "#FBF7EA",
          100: "#F4E8C1",
          200: "#E8D086",
          300: "#DDB84A",
          400: "#D4AF37",
          500: "#A88A28",
          600: "#7C6619",
          700: "#50410D",
          800: "#281D04",
          900: "#0C0901",
        },
        teal: {
          400: "#1B9AAA",
          500: "#157A87",
          600: "#0F5A64",
        },
        status: {
          success: "#2E8B57",
          warning: "#E6A817",
          danger: "#C1292E",
          info: "#1B9AAA",
        },
      },
      fontFamily: {
        serif: ["Noto Serif SC", "Georgia", "serif"],
        sans: ["Noto Sans SC", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(212, 175, 55, 0.25)",
        card: "0 4px 20px rgba(11, 37, 69, 0.08)",
        "card-hover": "0 8px 30px rgba(11, 37, 69, 0.15)",
        inner: "inset 0 2px 4px rgba(0, 0, 0, 0.05)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "noise":
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(212, 175, 55, 0.4)" },
          "50%": { boxShadow: "0 0 20px rgba(212, 175, 55, 0.7)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
