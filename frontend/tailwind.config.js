/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Command-centre palette: near-black surfaces, amber/red alert accents.
        ops: {
          950: "#070b12",
          900: "#0b1220",
          850: "#0f172a",
          800: "#141f33",
          700: "#1e293b",
          600: "#334155",
        },
        alert: {
          low: "#38bdf8",
          medium: "#fbbf24",
          high: "#fb923c",
          critical: "#f43f5e",
        },
        online: "#34d399",
        offline: "#f43f5e",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      boxShadow: {
        panel: "0 1px 2px rgba(0,0,0,0.6), 0 0 0 1px rgba(148,163,184,0.08)",
      },
    },
  },
  plugins: [],
};