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
  // unitsSnapshot() is a non-reactive, point-in-time read (Dimensions.get at
  // call time) — fine in plain utility/feature code, but inside a component
  // it silently produces stale values on resize instead of updating like
  // useUnits() does. Ban it where components/screens/Root live so picking
  // the wrong one is a lint error, not a runtime bug nobody notices.
  {
    files: ["src/components/**", "src/screens/**", "src/root/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/features/responsive",
              importNames: ["unitsSnapshot"],
              message:
                "unitsSnapshot() doesn't update on resize. Use useUnits() (or createStyles()) inside a component instead.",
            },
          ],
          patterns: [
            {
              group: ["@/features/responsive/units"],
              message:
                "Import from '@/features/responsive' and use useUnits() instead — unitsSnapshot() doesn't update on resize.",
            },
          ],
        },
      ],
    },
  },
]);
