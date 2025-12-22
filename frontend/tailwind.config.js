/** @type {import('tailwindcss').Config} */
module.exports = {
  // Dark mode'u 'class' stratejisine çekiyoruz (ThemeContext ile uyumlu olması için)
  darkMode: 'class', 
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Kendi semantik renklerimizi ekliyoruz
        // Artık bg-gray-900 yerine bg-app kullanacağız
        app: 'var(--bg-app)',
        surface: 'var(--bg-surface)',
        'surface-hover': 'var(--bg-surface-hover)',
        
        // Metinler
        'text-main': 'var(--text-main)',
        'text-secondary': 'var(--text-secondary)',
        'text-inverted': 'var(--text-inverted)',

        // Çizgiler
        border: 'var(--border-color)',

        // Ana Renk (Primary) - Mevcut blue/indigo yerine bunu kullan
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
        }
      },
    },
  },
  plugins: [],
}