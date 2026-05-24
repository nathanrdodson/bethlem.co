/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        navy: '#042C53',
        coral: '#D85A30',
        charcoal: '#2C2C2A',
        gray: '#888780',
        cream: '#FAF8F4',
        'coral-tint': '#FAECE7',
        'coral-border': '#F5C4B3',
        border: '#D3D1C7',
        'border-light': '#E8E6E0',
        tags: {
          blog: { bg: '#E6F1FB', text: '#185FA5' },
          resources: { bg: '#EAF3DE', text: '#3B6D11' },
          community: { bg: '#F1EFE8', text: '#5F5E5A' },
          forum: { bg: '#FAECE7', text: '#993C1D' },
        },
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      lineHeight: {
        reading: '1.8',
      },
      maxWidth: {
        prose: '680px',
      },
      typography: (theme) => ({
        bethlem: {
          css: {
            '--tw-prose-body': theme('colors.charcoal'),
            '--tw-prose-headings': theme('colors.navy'),
            '--tw-prose-links': theme('colors.coral'),
            '--tw-prose-bold': theme('colors.charcoal'),
            '--tw-prose-quotes': theme('colors.navy'),
            '--tw-prose-quote-borders': theme('colors.coral'),
            '--tw-prose-hr': theme('colors.border'),
            fontFamily: theme('fontFamily.sans').join(', '),
            fontSize: '1.0625rem',
            lineHeight: '1.8',
            h1: { fontFamily: theme('fontFamily.serif').join(', '), fontWeight: '700' },
            h2: { fontFamily: theme('fontFamily.serif').join(', '), fontWeight: '700' },
            h3: { fontFamily: theme('fontFamily.serif').join(', '), fontWeight: '700' },
            a: { color: theme('colors.coral'), fontWeight: '600', textDecoration: 'underline' },
            blockquote: { borderLeftColor: theme('colors.coral'), fontStyle: 'italic' },
          },
        },
      }),
    },
  },
  plugins: [],
};
