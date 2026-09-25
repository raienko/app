// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");
const globals = require("globals");

const { COMPONENTS } = require("./src/components/manifest.json");

/** Deep imports into another module's folder, past its entry point. */
const MODULE_BOUNDARY = [
  {
    group: ["@/components/*/**", "@/features/*/**"],
    message:
      "Import through the module's entry point ('@/components/<name>', '@/features/<name>'); files inside the folder are private to it.",
  },
];

const UNITS_SNAPSHOT = {
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
};

/** Components listed as internal in src/components/manifest.json. */
const INTERNAL_COMPONENTS = Object.entries(COMPONENTS)
  .filter(([, role]) => role === "internal")
  .map(([name]) => ({
    group: [`@/components/${name}`],
    message: `'${name}' is an internal building block for other components (src/components/manifest.json), not part of the public UI kit.`,
  }));

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
  // Import boundaries, one block per area so no two blocks set the same rule
  // for the same file (flat config replaces a rule's options rather than
  // merging them). Tests are exempt: they reach into internals on purpose.
  //
  // - MODULE_BOUNDARY: a component or feature is imported through its
  //   folder's entry point, never a file inside it.
  // - INTERNAL_COMPONENTS: building blocks for other components, not the UI
  //   kit — only src/components may use them.
  // - UNITS_SNAPSHOT: unitsSnapshot() is a point-in-time read
  //   (Dimensions.get at call time) — fine in plain utility/feature code,
  //   but inside a component it silently goes stale on resize instead of
  //   updating like useUnits() does.
  {
    files: ["src/components/**/*.{ts,tsx}"],
    ignores: ["**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: UNITS_SNAPSHOT.paths,
          patterns: [...MODULE_BOUNDARY, ...UNITS_SNAPSHOT.patterns],
        },
      ],
    },
  },
  {
    files: ["src/screens/**/*.{ts,tsx}", "src/root/**/*.{ts,tsx}"],
    ignores: ["**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: UNITS_SNAPSHOT.paths,
          patterns: [
            ...MODULE_BOUNDARY,
            ...INTERNAL_COMPONENTS,
            ...UNITS_SNAPSHOT.patterns,
          ],
        },
      ],
    },
  },
  {
    files: [
      "src/app/**/*.{ts,tsx}",
      "src/features/**/*.{ts,tsx}",
      "src/utils/**/*.{ts,tsx}",
      "src/constants/**/*.{ts,tsx}",
    ],
    ignores: ["**/*.test.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [...MODULE_BOUNDARY, ...INTERNAL_COMPONENTS] },
      ],
    },
  },
  // Design-system boundaries are enforceable rules, not review-time
  // conventions. Only their implementation files may reach the raw text and
  // image primitives; UI consumers use the wrappers that supply typography,
  // theme, fallback and accessibility behavior. The same boundary keeps raw
  // color literals and ad-hoc type scales out of component styles.
  {
    files: [
      "src/app/**/*.{ts,tsx}",
      "src/components/**/*.{ts,tsx}",
      "src/root/**/*.{ts,tsx}",
      "src/screens/**/*.{ts,tsx}",
    ],
    ignores: [
      "**/*.test.{ts,tsx}",
      "src/components/image/index.tsx",
      "src/components/text/index.tsx",
      "src/components/expo-ui-host/index.tsx",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "ImportDeclaration[source.value='react-native'] ImportSpecifier[imported.name='Text']",
          message:
            "Use '@/components/text' so app typography, color and direction are applied.",
        },
        {
          selector: "ImportDeclaration[source.value='expo-image']",
          message:
            "Use '@/components/image' so fallback and accessibility behavior are applied.",
        },
        {
          selector:
            "ImportDeclaration[source.value=/^@expo\\/ui(?:\\/(?:jetpack-compose|swift-ui))?$/] ImportSpecifier[imported.name='Host']",
          message:
            "Use '@/components/expo-ui-host' so Expo controls receive the app color scheme, seed color and layout direction.",
        },
        {
          selector: "Literal[value=/^(#[0-9A-Fa-f]{3,8}|rgba?\\(|hsla?\\()/]",
          message:
            "Use a semantic color from useTheme() instead of a raw UI color.",
        },
        {
          selector: "Literal[value=/^(black|white|red|blue|green|gray|grey)$/]",
          message:
            "Use a semantic color from useTheme() instead of a named UI color.",
        },
        {
          selector:
            "Property[key.name=/^(fontFamily|fontSize|fontWeight|lineHeight|letterSpacing)$/]",
          message:
            "Use a typography token from Text or createStyles() instead of defining an ad-hoc type style.",
        },
      ],
    },
  },
]);
