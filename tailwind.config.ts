import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./assessments/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-be-vietnam-pro)", "system-ui", "-apple-system", "sans-serif"],
        serif: ["var(--font-lora)", "Georgia", "serif"],
      },
      colors: {
        // V4 Warm Editorial Palette
        canvas: "#F5F1E8",
        surface: "#FFFDF8",
        surfaceStrong: "#FFFFFF",
        ink: "#1D211D",
        inkMuted: "#677069",
        line: "#D8D5CC",
        brand: {
          DEFAULT: "#245B47",
          dark: "#143C2F",
          soft: "#DDEBE3",
        },
        accent: {
          DEFAULT: "#E9B44C",
          soft: "#F8EAC1",
        },
        danger: {
          DEFAULT: "#B6473A",
          soft: "#F5DDD7",
        },
        info: {
          DEFAULT: "#315E9B",
          soft: "#DDE8F6",
        },
        // Backwards-compatible V3 educational accents
        edu: {
          50: "#f0fdf9",
          100: "#ccfbf1",
          200: "#99f6e4",
          300: "#5eead4",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
          800: "#115e59",
          900: "#134e4a",
          950: "#042f2e",
        },
        warm: {
          50: "#fafaf9",
          100: "#f5f5f4",
          200: "#e7e5e4",
          300: "#d6d3d1",
          400: "#a8a29e",
          500: "#78716c",
          600: "#57534e",
          700: "#44403c",
          800: "#292524",
          900: "#1c1917",
        },
      },
      borderRadius: {
        app: "14px",
        marketingWindow: "24px",
      },
      maxWidth: {
        marketing: "1280px",
        reading: "760px",
        diagnostic: "820px",
        insight: "1120px",
      },
    },
  },
  plugins: [],
};

export default config;
