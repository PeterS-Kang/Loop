// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./pages/**/*.{js,ts,jsx,tsx,mdx}",        // Include if using Pages Router
      "./components/**/*.{js,ts,jsx,tsx,mdx}",  // Include your components directory
      "./app/**/*.{js,ts,jsx,tsx,mdx}",          // Include if using App Router
      "./src/**/*.{js,ts,jsx,tsx}"
      // Add any other directories where you use Tailwind classes
    ],
    theme: {
      extend: {
        // You might have theme extensions here from previous steps
        // e.g., related to the CSS variables in globals.css
      },
    },
    plugins: [],
  }