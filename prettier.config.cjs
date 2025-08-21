// Prettier config (CJS) with optional Astro plugin.
// If 'prettier-plugin-astro' is installed, we'll load it; otherwise we won't error.
const plugins = [];
try {
  plugins.push(require('prettier-plugin-astro'));
} catch { }

module.exports = {
  semi: true,
  singleQuote: true,
  printWidth: 100,
  trailingComma: "es5",
  arrowParens: "always",
  endOfLine: "lf",
  plugins,
  useTabs: true,
  tabWidth: 4,
};
