import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50: "#f5f0ff", 100: "#ece2ff", 500: "#7c3aed", 600: "#6d28d9", 700: "#5b21b6", 950: "#1b1035" }
      }
    }
  },
  plugins: []
};
export default config;