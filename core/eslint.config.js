// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const globals = require("globals");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  // Root-level config files run under Node (app.config.ts, metro.config.js,
  // .storybook/*, jest.setup.js), unlike src/, which runs in the app bundle.
  {
    files: [
      "*.config.{js,ts}",
      ".storybook/**/*.{js,ts,tsx}",
      ".rnstorybook/**/*.{js,ts,tsx}",
    ],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ["jest.setup.js"],
    languageOptions: {
      globals: { ...globals.node, ...globals.jest },
    },
  },
]);
