/** @type {import('tailwindcss').Config} */
module.exports = {
  // Las clases también aparecen dentro de strings de app.js (className = '...')
  content: ['./index.html', './src/**/*.js'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        paper: { bg: '#FAF9F6', card: '#FFFFFF', subtle: '#F3F4F6', border: '#E5E7EB' },
      },
    },
  },
};
