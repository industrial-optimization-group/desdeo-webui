//
// See also `.eslintignore`
//

module.exports = {
  // Don't look for configuration files outside the project directory
  root: true,

  plugins: [
    "@typescript-eslint",
    "eslint-plugin-svelte",
    "eslint-plugin-tailwindcss",
  ],

  //
  // Use the TypeScript parser as the default parser
  // See https://typescript-eslint.io/architecture/parser/#configuration
  //
  parser: "@typescript-eslint/parser",
  parserOptions: {
    extraFileExtensions: [".svelte"],
    project: ["./tsconfig.json"],
  },

  //
  // *.svelte files are parsed by the Svelte parser, which again
  // passes the embedded scripts to the TypeScript parser.
  //
  overrides: [
    {
      files: ["*.svelte"],

      // TODO: Should the parser options be adjusted?
      parser: "svelte-eslint-parser",
      parserOptions: {
        //
        // The TypeScript parser uses the options set above
        // See https://github.com/typescript-eslint/typescript-eslint/issues/6778
        //
        parser: "@typescript-eslint/parser",
      },
    },
  ],

  // The linting rules
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:svelte/recommended",
    "plugin:tailwindcss/recommended",

    // Turn off rules that conflict with Prettier
    "prettier",
    "plugin:svelte/prettier",
    "plugin:storybook/recommended",
  ],

  // See https://eslint.org/docs/latest/use/configure/language-options
  env: {
    browser: true,
    es2020: true,
  },
};
