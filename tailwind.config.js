/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          'dark-slate': '#2E3440',
          'vibrant-cyan': '#61AFEF',
          'soft-white': '#ECEFF4',
        },
      },
    },
    plugins: [],
  }