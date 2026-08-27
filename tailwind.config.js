/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        head: ["Prompt", "Noto Sans Thai", "system-ui", "sans-serif"],
        body: ["Noto Sans Thai", "Prompt", "system-ui", "sans-serif"],
      },
      colors: {
        bg: "oklch(98% 0.012 80)",
        surface: "oklch(100% 0 0)",
        surfacealt: "oklch(96% 0.015 80)",
        border: "oklch(90% 0.012 80)",
        ink: "oklch(22% 0.02 80)",
        ink2: "oklch(48% 0.02 80)",
        ink3: "oklch(64% 0.015 80)",
        primary: "oklch(55% 0.13 165)",
        primarydark: "oklch(42% 0.12 165)",
        primarytint: "oklch(94% 0.05 165)",
        accent: "oklch(72% 0.14 70)",
        accenttint: "oklch(94% 0.06 70)",
        danger: "oklch(55% 0.18 25)",
        dangertint: "oklch(94% 0.05 25)",
      },
      borderRadius: {
        xl2: "18px",
      },
    },
  },
  plugins: [],
};
