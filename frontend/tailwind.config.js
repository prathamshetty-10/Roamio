/** @type {import('tailwindcss').Config} */
import lineClamp from '@tailwindcss/line-clamp';
export default {
  content: ["./src/**/*.{html,js,jsx,tsx,ts}","./index.html"],
  theme: {
    extend: {},
  },
  plugins: [lineClamp],
}
