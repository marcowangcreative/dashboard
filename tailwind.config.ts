import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#F1EAD9",
          deep:   "#E7DEC8",
          edge:   "#D8CCAE",
        },
        ink: {
          DEFAULT: "#1C1812",
          soft:    "#4A4236",
          faint:   "#8A8172",
        },
        accent: {
          DEFAULT: "#B0451F",
          soft:    "#C76F3F",
        },
        sage: "#3E5B44",
        dust: "#CFB58A",
        cat: {
          photo:    "#2E5568",
          hair:     "#A8574E",
          weddings: "#8E5378",
          misc:     "#7F7869",
        },
        link: {
          live:   "#3E5B44",
          repo:   "#1C1812",
          db:     "#B0451F",
          host:   "#334A6B",
          design: "#7A4A8C",
          docs:   "#4A4236",
        },
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans:    ["var(--font-instrument-sans)", "system-ui", "sans-serif"],
        mono:    ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
