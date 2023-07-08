const { join } = require("path");
const forms = require("@tailwindcss/forms");
const skeleton = require("@skeletonlabs/skeleton/tailwind/skeleton.cjs");

/** @type {import("tailwindcss").Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{html,js,svelte,ts}",
    join(
      require.resolve("@skeletonlabs/skeleton"),
      "../**/*.{html,js,svelte,ts}"
    ),
  ],
  theme: {
    extend: {},
  },
  plugins: [forms, ...skeleton()],
};
