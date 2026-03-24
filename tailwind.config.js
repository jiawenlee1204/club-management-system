export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'notion-bg': '#FFFFFF',
        'notion-bg-secondary': '#FAFAFA',
        'notion-text': '#000000',
        'notion-text-secondary': '#666666',
        'notion-border': '#000000',
      },
      fontFamily: {
        sans: ['Inter', 'PingFang SC', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'line-art': '4px 4px 0px #000000',
        'line-art-hover': '6px 6px 0px #000000',
        'line-art-input': '2px 2px 0px rgba(0, 0, 0, 0.1)',
      },
      borderWidth: {
        'line-art': '2px',
      }
    },
  },
  plugins: [],
}
