/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
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
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
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
        // Playful accent colors (flat solid only, no gradients/glows)
        sky: {
          DEFAULT: "#4A90E2",
          50: "#EDF3FC",
          100: "#D6E6F8",
          200: "#B0D3F1",
          300: "#8ABFEA",
          400: "#6AABE4",
          500: "#4A90E2",
          600: "#2E75C9",
          700: "#23599B",
          800: "#183D6D",
          900: "#0C223F",
        },
        coral: {
          DEFAULT: "#FF6B6B",
          50: "#FFF0F0",
          100: "#FFDADA",
          200: "#FFB5B5",
          300: "#FF9090",
          400: "#FF7A7A",
          500: "#FF6B6B",
          600: "#E54545",
          700: "#B82E2E",
          800: "#8A2020",
          900: "#5C1414",
        },
        sunny: {
          DEFAULT: "#FFD93D",
          50: "#FFFBE6",
          100: "#FFF5C2",
          200: "#FFEB8A",
          300: "#FFE152",
          400: "#FFDB3D",
          500: "#FFD93D",
          600: "#E5C000",
          700: "#B89A00",
          800: "#8A7400",
          900: "#5C4D00",
        },
        fresh: {
          DEFAULT: "#6BCB77",
          50: "#F0FAF1",
          100: "#D6F3DA",
          200: "#ADE7B5",
          300: "#84DB90",
          400: "#6BCB77",
          500: "#4DB85B",
          600: "#3A9A48",
          700: "#2D7A38",
          800: "#205A29",
          900: "#133A1A",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        // Minimal functional shadows only — no glows
        contact: "0 1px 3px rgb(0 0 0 / 0.08), 0 1px 2px rgb(0 0 0 / 0.04)",
        card: "0 2px 8px rgb(0 0 0 / 0.06)",
        elevated: "0 4px 16px rgb(0 0 0 / 0.08)",
        // Dashboard hover glows — used sparingly, on direct interaction only
        "glow-sky": "0 8px 24px -8px rgb(74 144 226 / 0.35)",
        "glow-coral": "0 8px 24px -8px rgb(255 107 107 / 0.35)",
        "glow-sunny": "0 8px 24px -8px rgb(229 192 0 / 0.35)",
        "glow-fresh": "0 8px 24px -8px rgb(77 184 91 / 0.35)",

        // Layered "premium" shadow system — stacked ambient + contact shadows,
        // same neutral tone as the existing `card`/`elevated` shadows so it
        // slots in without touching color. Use for cards/panels/popovers that
        // need more depth than `elevated` without introducing a glow.
        "layer-sm":
          "0 1px 2px rgb(0 0 0 / 0.04), 0 2px 6px -2px rgb(0 0 0 / 0.06)",
        "layer-md":
          "0 2px 4px rgb(0 0 0 / 0.04), 0 8px 20px -6px rgb(0 0 0 / 0.10)",
        "layer-lg":
          "0 4px 8px rgb(0 0 0 / 0.04), 0 16px 40px -12px rgb(0 0 0 / 0.14)",
        "layer-xl":
          "0 8px 16px rgb(0 0 0 / 0.05), 0 24px 64px -16px rgb(0 0 0 / 0.18)",
        // Inner hairline used on glass/elevated surfaces for a subtle rim-light
        "inset-hairline": "inset 0 1px 0 0 rgb(255 255 255 / 0.06)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          from: { backgroundPosition: "-200% 0" },
          to: { backgroundPosition: "200% 0" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.85)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "fade-in": "fade-in 0.4s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        shimmer: "shimmer 2s ease-in-out infinite",
        "pulse-dot": "pulse-dot 1.8s ease-in-out infinite",
      },
      // CSS-side spring-shaped easing curves, for anything that can't use
      // framer-motion's JS spring (plain CSS transitions, marquee, etc).
      // `-out` curves overshoot slightly then settle; `-in-out` is symmetric.
      transitionTimingFunction: {
        "spring-out": "cubic-bezier(0.16, 1.36, 0.34, 1)",
        "spring-soft": "cubic-bezier(0.22, 1, 0.36, 1)",
        "spring-in-out": "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      // Fluid display sizes for hero/section headlines — scales with viewport
      // width so headlines "command attention" on desktop without needing a
      // manual sm:/lg: ladder, and never overflow on mobile.
      fontSize: {
        "display-lg": [
          "clamp(2.75rem, 2rem + 3.2vw, 5.5rem)",
          { lineHeight: "1.02", letterSpacing: "-0.03em", fontWeight: "700" },
        ],
        "display-md": [
          "clamp(2.25rem, 1.7rem + 2.4vw, 4rem)",
          { lineHeight: "1.05", letterSpacing: "-0.025em", fontWeight: "700" },
        ],
        "display-sm": [
          "clamp(1.75rem, 1.4rem + 1.6vw, 2.75rem)",
          { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "600" },
        ],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}