import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F5F2EB",
        ink: "#1A1A1A",
        accent: "#0E6E63",
        accent2: "#C96A2A",
        muted: "#ECE5D8"
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Manrope", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
