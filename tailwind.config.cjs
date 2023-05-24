/** @type {import("tailwindcss").Config} */
const config = {
  darkMode: "class",
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    /* eslint-disable-next-line @typescript-eslint/no-var-requires */
    require("path").join(
      require.resolve("@skeletonlabs/skeleton"),
      "../**/*.{html,js,svelte,ts}"
    ),
  ],
  theme: {
    extend: {},
  },
  plugins: [
    /* eslint-disable-next-line @typescript-eslint/no-var-requires */
    ...require("@skeletonlabs/skeleton/tailwind/skeleton.cjs")(),
  ],
};

module.exports = config;
