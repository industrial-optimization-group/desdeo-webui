module.exports = {
  "*": ["prettier --check"],
  "*.{js,ts,svelte}": ["prettier --check", "eslint --max-warnings 0"],
};
