// This file has been automatically migrated to valid ESM format by Storybook.
import { createRequire } from "node:module";

import { transformAsync } from "@babel/core";

import type { StorybookConfig } from "@storybook/react-native-web-vite";
import { loadEnv, type Alias, type Plugin } from "vite";

const require = createRequire(import.meta.url);

/**
 * Skia's web build reaches into a React Native internal
 * (`react-native/Libraries/Image/AssetRegistry`) that react-native-web only
 * ships under its own path, so the framework's blanket `react-native` →
 * `react-native-web` alias points it at a file that doesn't exist and the
 * dependency optimizer aborts.
 *
 * Done as a plugin rather than in `resolve.alias`: Vite puts aliases that
 * plugins contribute *ahead* of the user's, and the alias plugin applies
 * only the first match, so an entry added in `viteFinal` never gets a turn.
 * Inserting it once the config is final puts it first.
 */
const assetRegistryAlias: Plugin = {
  name: "app:react-native-asset-registry",
  enforce: "pre",
  configResolved(resolved) {
    (resolved.resolve.alias as Alias[]).unshift({
      find: /^react-native\/Libraries\/Image\/AssetRegistry$/,
      replacement:
        require.resolve("react-native-web/dist/modules/AssetRegistry"),
    });
  },
};

/**
 * The icon sets that ship their font as a `require("../fonts/X.ttf")`.
 * Excluded from dependency pre-bundling so the transform below reaches them.
 */
const ICON_FONT_PACKAGES = [
  "@react-native-vector-icons/ant-design",
  "@react-native-vector-icons/feather",
  "@react-native-vector-icons/fontawesome6",
  "@react-native-vector-icons/ionicons",
  "@react-native-vector-icons/material-icons",
];

/**
 * Under Metro, `require("../fonts/Feather.ttf")` is an asset id the icon
 * loader looks up in the asset registry. Vite has no such registry, so the
 * require becomes a module object and every icon fails with "no asset found
 * for font family". The loader also accepts a plain URI, so each font
 * require is swapped for a Vite `?url` import of the same file.
 */
const iconFontUrls: Plugin = {
  name: "app:vector-icon-font-urls",
  enforce: "pre",
  transform(code, id) {
    if (
      !/@react-native-vector-icons\/(?!common\/)[^/]+\/lib\/module\//.test(id)
    ) {
      return null;
    }
    const imports: string[] = [];
    const next = code.replace(
      /require\((["'])([^"']+\.(?:ttf|otf))\1\)/g,
      (_match, _quote, file: string) => {
        const name = `__iconFont${imports.length}`;
        imports.push(`import ${name} from ${JSON.stringify(`${file}?url`)};`);
        return name;
      },
    );
    return imports.length === 0 ? null : `${imports.join("\n")}\n${next}`;
  },
};

/**
 * Library code that calls Reanimated's hooks and ships compiled without the
 * worklets Babel transform, relying on the app's bundler to apply it — as
 * Metro does through babel-preset-expo. Without it every such hook throws on
 * web ("used without a dependency array or Babel plugin").
 */
const WORKLET_LIBRARIES =
  /[\\/]node_modules[\\/]victory-native[\\/]dist[\\/].*\.js$/;

/**
 * The same worklets transform, applied while Vite pre-bundles dependencies.
 * `pluginReactOptions.babel` below only reaches the app's own source;
 * pre-bundled packages never pass through it.
 */
const libraryWorklets = {
  name: "app:library-worklets",
  transform: {
    filter: { id: WORKLET_LIBRARIES },
    async handler(code: string, id: string) {
      const result = await transformAsync(code, {
        filename: id,
        babelrc: false,
        configFile: false,
        sourceMaps: true,
        // The compiled output still contains JSX; parse it, leave it as is.
        parserOpts: { plugins: ["jsx"] },
        plugins: ["react-native-worklets/plugin"],
      });
      return result?.code
        ? { code: result.code, map: result.map ?? undefined }
        : null;
    },
  },
};

const config: StorybookConfig = {
  framework: {
    name: "@storybook/react-native-web-vite",
    options: {
      pluginReactOptions: {
        babel: {
          // What babel-preset-expo adds under Metro. Without it Reanimated's
          // hooks can't find their worklets' dependencies on web and throw on
          // the first render of any animated component (Accordion, Modal,
          // Toast, ProgressBar, Skeleton, Timer).
          plugins: ["react-native-worklets/plugin"],
        },
      },
    },
  },

  stories: ["../src/**/*.stories.?(ts|tsx|js)"],

  async viteFinal(viteConfig) {
    // Metro inlines EXPO_PUBLIC_* vars from .env automatically; Vite doesn't,
    // so mirror that here for parity between the on-device and web Storybook.
    const env = loadEnv("development", process.cwd(), "EXPO_PUBLIC_");
    return {
      ...viteConfig,
      plugins: [
        ...(viteConfig.plugins ?? []),
        assetRegistryAlias,
        iconFontUrls,
      ],
      optimizeDeps: {
        ...viteConfig.optimizeDeps,
        exclude: [
          ...(viteConfig.optimizeDeps?.exclude ?? []),
          ...ICON_FONT_PACKAGES,
        ],
        rolldownOptions: {
          ...viteConfig.optimizeDeps?.rolldownOptions,
          // Expo SDK packages (`expo`, `expo-image`, `expo-image-picker`, …)
          // point `main` at their TypeScript source. When the dependency
          // scanner can't parse an entry it retries as JSX unless told the
          // extension's real type, and `import { type X }` then fails to
          // parse and takes the whole dev server down.
          moduleTypes: {
            ...viteConfig.optimizeDeps?.rolldownOptions?.moduleTypes,
            ".ts": "ts",
            ".tsx": "tsx",
          },
          // Once parsed as TypeScript, `expo-modules-core`'s ts-declarations
          // import classes that only exist as `declare class` — erased at
          // compile time, so there's no runtime export to find. They're used
          // purely as types, so an `undefined` stand-in is exactly right.
          shimMissingExports: true,
          plugins: [
            ...[viteConfig.optimizeDeps?.rolldownOptions?.plugins ?? []].flat(),
            libraryWorklets,
          ],
        },
      },
      define: {
        ...viteConfig.define,
        ...Object.fromEntries(
          Object.entries(env).map(([key, value]) => [
            `process.env.${key}`,
            JSON.stringify(value),
          ]),
        ),
      },
    };
  },
};

export default config;
