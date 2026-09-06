import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#111111',
          light: '#444444',
        },
        bg: '#FAFAF8',
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F0EFEA',
        },
        teal: {
          DEFAULT: '#376A6B',
          light: '#5A9798',
          pale: '#E0EDEE',
        },
        cream: '#D4CDB2',
        border: '#E2E0D8',
        // Boundary colour for form controls: 3:1 against a white field (WCAG 1.4.11).
        field: '#8F8B7B',
        // Error / destructive text: 5.9:1 on white.
        danger: '#B23B2E',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      borderRadius: {
        card: '10px',
        btn: '7px',
      },
      fontSize: {
        hero: ['clamp(52px,6vw,80px)', { lineHeight: '1.0', letterSpacing: '-0.02em' }],
        h1: ['clamp(40px,5vw,64px)', { lineHeight: '1.0', letterSpacing: '-0.02em' }],
        h2: ['clamp(32px,4vw,48px)', { lineHeight: '1.05', letterSpacing: '-0.01em' }],
        h3: ['clamp(22px,2.5vw,32px)', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
      },
    },
  },
  plugins: [],
  safelist: [
    'object-top',
    'object-center',
    'object-bottom',
  ],
}

export default config
