module.exports = {
  content: ['./src/**/*.{html,js,svelte}'],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui')
  ],
  daisyui: {
    themes: ["light", "business"],
    logs: true,
    darkTheme: "business",
  },
}
