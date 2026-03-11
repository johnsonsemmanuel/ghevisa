import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Ghana-inspired premium palette
        primary: {
          DEFAULT: '#1a1d23',
          light: '#2a2e36',
          dark: '#111318',
        },
        accent: {
          DEFAULT: '#006B3F',
          light: '#0D8050',
          dark: '#005A34',
        },
        gold: {
          DEFAULT: '#C8962E',
          light: '#D4A94B',
          dark: '#B08425',
        },
        // Semantic colors
        success: '#006B3F',
        warning: '#C8962E',
        danger: '#CE1126',
        info: '#2E6B96',
        // UI colors
        sidebar: {
          DEFAULT: '#1a1d23',
          hover: '#2a2e36',
          active: '#006B3F',
        },
        surface: '#F7F8FA',
        card: '#FFFFFF',
        border: {
          DEFAULT: '#E5E7EB',
          light: '#F1F3F5',
        },
        text: {
          primary: '#111827',
          secondary: '#4B5563',
          muted: '#6B7280', // Improved contrast from #9CA3AF
        },
        highlight: {
          DEFAULT: '#E8F5EE',
          foreground: '#005A34',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
        poppins: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
      },
      spacing: {
        '0.5': '0.125rem',  // 2px
        '1': '0.25rem',     // 4px
        '1.5': '0.375rem',  // 6px
        '2': '0.5rem',      // 8px
        '2.5': '0.625rem',  // 10px
        '3': '0.75rem',     // 12px
        '3.5': '0.875rem',  // 14px
        '4': '1rem',        // 16px
        '5': '1.25rem',     // 20px
        '6': '1.5rem',      // 24px
        '7': '1.75rem',     // 28px
        '8': '2rem',        // 32px
        '10': '2.5rem',     // 40px
        '12': '3rem',       // 48px
        '16': '4rem',       // 64px
        '20': '5rem',       // 80px
        '24': '6rem',       // 96px
      },
      borderRadius: {
        'sm': '0.375rem',   // 6px
        'DEFAULT': '0.5rem', // 8px
        'md': '0.5rem',     // 8px
        'lg': '0.75rem',    // 12px
        'xl': '1rem',       // 16px
        '2xl': '1.5rem',    // 24px
        '3xl': '2rem',      // 32px
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 2px 8px -2px rgb(0 0 0 / 0.06)',
        'md': '0 2px 6px 0 rgb(0 0 0 / 0.06), 0 6px 20px -4px rgb(0 0 0 / 0.08)',
        'lg': '0 4px 8px -1px rgb(0 0 0 / 0.06), 0 10px 28px -6px rgb(0 0 0 / 0.1)',
        'xl': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [],
}

export default config
