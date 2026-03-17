/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        aura: {
          bg: '#020617', // Deep obsidian
          card: 'rgba(15, 23, 42, 0.4)', // Slate translucence
          accent: '#22d3ee', // Electric Cyan
          'accent-dim': '#0891b2',
          text: '#f8fafc',
          secondary: '#94a3b8',
          border: 'rgba(255, 255, 255, 0.05)',
        }
      },
      backgroundImage: {
        'aura-glow': 'radial-gradient(circle at 50% -20%, #0e7490 0%, #020617 70%)',
        'cyan-purple-gradient': 'linear-gradient(135deg, #22d3ee 0%, #8b5cf6 100%)',
      },
      boxShadow: {
        'aura-glow': '0 0 30px rgba(34, 211, 238, 0.15)',
        'cyan-glow': '0 0 20px rgba(34, 211, 238, 0.4)',
      }
    },
  },
  plugins: [],
};
