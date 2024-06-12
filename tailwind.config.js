/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#3555A2',
        button: '#FF5C36',
        box: '#ffffff',
      },
    },
  },
  darkMode: false, // Disable dark mode
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#FF5C36",  // Button color
          "secondary": "#3555A2", // Background color
          "accent": "#ffffff",    // Box and form color
          "neutral": "#ffffff",   // Neutral color for forms and boxes
          "base-100": "#ffffff",  // Base color for light theme
        },
      },
    ],
    darkTheme: false, // Ensure dark mode is disabled
  },
};
