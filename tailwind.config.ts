import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", md: "2rem" },
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        // Identidade ChikJov
        brand: {
          // Roxo primário
          50: "#F5F0FF",
          100: "#EADCFF",
          200: "#D4B8FF",
          300: "#B888FF",
          400: "#9B5FFF",
          500: "#7C3AED", // base
          600: "#6B21D9",
          700: "#5618B0",
          800: "#3F1281",
          900: "#290B57",
        },
        accent: {
          // Laranja CTA
          50: "#FFF4EB",
          100: "#FFE3CC",
          200: "#FFC089",
          300: "#FF9B47",
          400: "#FF7E1B",
          500: "#F26B0A", // base CTA
          600: "#D45504",
          700: "#A84304",
          800: "#7A3103",
          900: "#4D1F02",
        },
        ink: {
          DEFAULT: "#0F0A1F",
          muted: "#5A5670",
          subtle: "#8A869A",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          soft: "#FAF8FD",
          muted: "#F1ECF8",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        card: "0 4px 20px -4px rgba(124, 58, 237, 0.08)",
        cta: "0 10px 30px -8px rgba(242, 107, 10, 0.45)",
        soft: "0 2px 12px -2px rgba(15, 10, 31, 0.06)",
      },
      keyframes: {
        scroll: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        scroll: "scroll 28s linear infinite",
        "fade-up": "fade-up 0.5s ease-out",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #7C3AED 0%, #5618B0 100%)",
        "accent-gradient": "linear-gradient(135deg, #FF9B47 0%, #F26B0A 100%)",
        "hero-blob": "radial-gradient(60% 60% at 30% 30%, #B888FF 0%, transparent 70%)",
      },
    },
  },
  plugins: [],
};

export default config;
