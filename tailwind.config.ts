import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          violet: "#6C47FF",
          "violet-dark": "#5323E6",
          "violet-light": "#F1EBFF",
          "violet-dim": "#C9BEFF",
          emerald: "#10B981",
          "emerald-dark": "#006C49",
          "emerald-light": "#ECFDF5",
          amber: "#F59E0B",
          "amber-light": "#FEF3C7",
          slate: "#0F172A",
          muted: "#64748B",
          border: "#E2E8F0",
          canvas: "#FAF8FF",
          card: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      boxShadow: {
        tactile: "0px 4px 20px -2px rgba(15, 23, 42, 0.05)",
        card: "0px 6px 24px -4px rgba(15, 23, 42, 0.08)",
        glow: "0px 8px 24px -4px rgba(108, 71, 255, 0.35)",
        float: "0px 10px 25px -4px rgba(15, 23, 42, 0.08)",
        bottombar: "0px -4px 16px rgba(15, 23, 42, 0.04)",
      },
      borderRadius: {
        tactile: "16px",
      },
    },
  },
  plugins: [],
} satisfies Config;
