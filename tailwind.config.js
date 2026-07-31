export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#eef2ff', 100:'#e0e7ff', 500:'#6366f1', 600:'#4f46e5', 700:'#4338ca', 900:'#1e1b4b' },
        neon: { green:'#00ff88', blue:'#00d4ff', purple:'#b347ff', orange:'#ff6b35' }
      },
      fontFamily: { display: ['Space Grotesk','sans-serif'], mono: ['JetBrains Mono','monospace'] }
    }
  },
  plugins: []
}
