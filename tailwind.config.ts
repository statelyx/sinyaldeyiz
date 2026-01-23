import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Ana tema renkleri: Siyah + Sarı
        primary: {
          50: '#fefce8',    // Çok açık sarı
          100: '#fef9c3',   // Açık sarı
          200: '#fef08a',   // Sarı
          300: '#fde047',   // Sarı
          400: '#facc15',   // Sarı
          500: '#eab308',   // Ana sarı
          600: '#ca8a04',   // Koyu sarı
          700: '#a16207',   // Amber
          800: '#854d0e',   // Amber
          900: '#713f12',   // Koyu amber
          950: '#422006',   // En koyu amber
        },
        dark: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',  // Siyah
        },
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'primary-gradient': 'linear-gradient(135deg, #facc15 0%, #f97316 100%)',
        'dark-gradient': 'linear-gradient(135deg, rgba(0, 0, 0, 0.9) 0%, rgba(17, 24, 39, 0.95) 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow': '0 0 20px rgba(250, 204, 21, 0.3)',
        'glow-lg': '0 0 40px rgba(250, 204, 21, 0.4)',
      },
    },
  },
  plugins: [],
}
export default config
