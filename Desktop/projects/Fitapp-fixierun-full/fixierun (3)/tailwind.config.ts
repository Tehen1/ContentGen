import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "cyberpunk-dark": "#0f0f1a",
        "cyberpunk-darker": "#060612",
        "neon-purple": "#9c5cff",
        "neon-blue": "#5d8eff",
        "neon-pink": "#ff2a6d",
        "neon-red": "#ff3864",
        "neon-orange": "#ff9e00",
        accent: "#9c5cff",
        primary: "#5D5CDE",
        "primary-dark": "#4a49b0",
        "primary-light": "#7978e9",
        "text-dark": "#E5E7EB",
        "text-light": "#F9FAFB",
        "bg-light": "#0f0f1a",
        "bg-dark": "#060612",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        "neon-glow": '0 0 5px theme("colors.neon-purple"), 0 0 20px theme("colors.neon-purple")',
        "neon-pink-glow": '0 0 5px theme("colors.neon-pink"), 0 0 20px theme("colors.neon-pink")',
        "neon-blue-glow": '0 0 5px theme("colors.neon-blue"), 0 0 20px theme("colors.neon-blue")',
      },
      fontFamily: {
        cyber: ["var(--font-orbitron)", "sans-serif"],
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      backgroundImage: {
        "cyber-grid": "radial-gradient(#5D5CDE 1px, transparent 1px), radial-gradient(#5D5CDE 1px, transparent 1px)",
      },
      backgroundSize: {
        "cyber-grid-size": "20px 20px",
      },
      backgroundPosition: {
        "cyber-grid-pos": "0 0, 10px 10px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
