module.exports = {
  "*": "prettier --check",

  //
  // ESLint outputs a warning if we try to lint a file that is ignored
  // by the rules in `.eslintignore`
  //
  "{src,tests}/**/*.{js,svelte,ts}": "eslint --max-warnings 0",
};
