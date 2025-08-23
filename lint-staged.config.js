module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{py}': ['black', 'isort', 'pylint'],
  '*.{json,md,yml,yaml}': ['prettier --write'],
};