module.exports = {
  '*.{js,jsx,ts,tsx}': ['pnpm exec eslint --fix', 'pnpm exec prettier --write'],
  '*.py': ['uv run black', 'uv run isort', 'uv run pylint --errors-only'],
  '*.{json,md,yml,yaml}': ['pnpm exec prettier --write'],
};
