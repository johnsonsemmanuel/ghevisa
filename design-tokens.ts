/**
 * Design Tokens for Ghana Travel Authorization Platform
 * 
 * Centralized design system tokens for consistent UI implementation
 * across all dashboards and portals.
 */

export const designTokens = {
  colors: {
    // Primary colors
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
    
    // Risk score colors (specification-compliant)
    risk: {
      low: '#006B3F',      // Ghana green
      medium: '#C8962E',   // Gold
      high: '#FF8C00',     // Orange
      critical: '#CE1126', // Ghana red
    },
    
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
      muted: '#6B7280', // Improved from #9CA3AF for better contrast
    },
  },
  
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '1rem',     // 16px
    md: '1.5rem',   // 24px
    lg: '2rem',     // 32px
    xl: '3rem',     // 48px
    '2xl': '4rem',  // 64px
  },
  
  typography: {
    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  borderRadius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 2px 8px -2px rgb(0 0 0 / 0.06)',
    lg: '0 2px 6px 0 rgb(0 0 0 / 0.06), 0 6px 20px -4px rgb(0 0 0 / 0.08)',
    xl: '0 4px 8px -1px rgb(0 0 0 / 0.06), 0 10px 28px -6px rgb(0 0 0 / 0.1)',
  },
} as const

export type DesignTokens = typeof designTokens
