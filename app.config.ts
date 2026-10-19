import type { ConfigContext, ExpoConfig } from "expo/config";

// Imported via require: Expo transpiles only this entry file when loading
// app.config.ts, so a relative *.ts import can't be resolved here —
// constants/env/index.js (typed by the sibling index.d.ts) is required
// directly instead. Plain `require` returns module.exports as-is (the env
// object itself), matching its default export.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- see comment above
const env = require("./src/constants/env");
// Same reason, and typed by hand: the app's tsconfig has no Node types, and
// pulling them in for this one call would type every timer in src/ as Node's.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- see above
const { existsSync } = require("fs") as {
  existsSync: (path: string) => boolean;
};

const { version: packageVersion } = require("./package.json") as {
  version: string;
};
const storybookEnabled = process.env.STORYBOOK_ENABLED === "true";

/**
 * Everything that carries the app's identity — the icons, the splash, the
 * favicon — is generated into one directory by `yarn brand` (and every
 * `yarn install`) from assets/brand/brand.json and its logo, together with
 * the brand's .env keys and the theme palette. See assets/brand/README.md.
 *
 * `assets/images` keeps what a *screen* draws; nothing under here is
 * imported by the app at runtime. The two are separate for that reason
 * rather than by file type: these paths are read by Expo at config time and
 * baked into the native projects, while the others go through Metro.
 */
const BRAND_DIR = "./assets/brand/generated";

/**
 * A path under `assets/brand/generated`, relative to the project root, which is what
 * every Expo config field here expects.
 *
 * A helper rather than the literal seven times over: the directory name
 * appears once, so moving it is one edit, and a typo in a path that Expo
 * only reads at prebuild time is otherwise the kind of mistake that surfaces
 * as a missing icon on a build machine.
 */
const brandAsset = (file: string): string => `${BRAND_DIR}/${file}`;

/**
 * The optional brand file — only there when a brand ships a hand-made
 * Android icon background. Passing Expo a path that doesn't exist fails prebuild, so each is
 * included only when it's there.
 */
const hasBrandAsset = (projectRoot: string, file: string): boolean =>
  existsSync(`${projectRoot}/${BRAND_DIR}/${file}`);

// Universal links (iOS) and app links (Android) only ever reach the app if
// the OS knows the app claims those domains, so both native declarations are
// generated from the one list in EXPO_PUBLIC_APP_LINK_DOMAINS. Left out
// entirely when it's empty: an empty associatedDomains array is not the same
// as no entitlement, and an intent filter with no data is a filter that
// matches nothing. Custom-scheme deep links (`scheme` above) need none of
// this and work either way.
const appLinkDomains: string[] = env.appLinkDomains;

const iosAppLinks =
  appLinkDomains.length > 0
    ? {
        associatedDomains: appLinkDomains.map((domain) => `applinks:${domain}`),
      }
    : {};

const androidAppLinks =
  appLinkDomains.length > 0
    ? {
        intentFilters: [
          {
            action: "VIEW",
            // Verified against /.well-known/assetlinks.json on each domain,
            // which is what lets the link open the app without a chooser.
            autoVerify: true,
            category: ["BROWSABLE", "DEFAULT"],
            data: appLinkDomains.map((host) => ({ scheme: "https", host })),
          },
        ],
      }
    : {};

export default ({ config, projectRoot }: ConfigContext): ExpoConfig => ({
  ...config,
  name: env.appName,
  slug: env.appSlug,
  scheme: env.appScheme,
  // One version for the app: package.json's, which the Release workflow
  // reads and a release bumps.
  version: packageVersion,
  orientation: "portrait",
  icon: brandAsset("icon.png"),
  userInterfaceStyle: "automatic",
  ios: {
    ...config.ios,
    bundleIdentifier: env.appBundleId,
    // Apple's Icon Composer bundle, which iOS 26+ uses in preference to the
    // flat `icon` above for its glass treatment.
    icon: brandAsset("icon-ios.icon"),
    ...iosAppLinks,
  },
  android: {
    ...config.android,
    package: env.appBundleId,
    adaptiveIcon: {
      backgroundColor: env.brandIconBackground,
      foregroundImage: brandAsset("icon-android-foreground.png"),
      // Usually just `backgroundColor`; an image only for a brand that ships
      // a textured or gradient background by hand.
      ...(hasBrandAsset(projectRoot, "icon-android-background.png")
        ? { backgroundImage: brandAsset("icon-android-background.png") }
        : {}),
      monochromeImage: brandAsset("icon-android-monochrome.png"),
    },
    predictiveBackGestureEnabled: false,
    ...androidAppLinks,
  },
  web: {
    output: "server",
    favicon: brandAsset("favicon.png"),
  },
  extra: {
    ...config.extra,
    // Only with a real EAS project id: a placeholder (an empty string, 0)
    // is read by EAS as a project to link to and fails every eas command.
    ...(env.projectId
      ? { eas: { ...config.extra?.eas, projectId: env.projectId } }
      : {}),
  },
  plugins: [
    "expo-router",
    "expo-localization",
    "expo-notifications",
    [
      "expo-image-picker",
      {
        photosPermission: `Allow ${env.appName} to choose images from your photo library.`,
        cameraPermission: `Allow ${env.appName} to take photos.`,
        microphonePermission: false,
      },
    ],
    [
      "expo-location",
      {
        // Foreground only: enough to centre a map on the user and show
        // what's nearby. No background location is ever requested.
        locationWhenInUsePermission: `Allow ${env.appName} to show places near you.`,
      },
    ],
    "@maplibre/maplibre-react-native",
    ...(storybookEnabled ? ["@react-native-community/datetimepicker"] : []),
    "@react-native-vector-icons/feather",
    "@react-native-vector-icons/material-icons",
    "@react-native-vector-icons/ionicons",
    "@react-native-vector-icons/fontawesome6",
    "@react-native-vector-icons/ant-design",
    [
      "expo-splash-screen",
      {
        backgroundColor: env.brandSplashBackground,
        image: brandAsset("splash.png"),
        imageWidth: 76,
        ...(env.brandSplashBackgroundDark
          ? {
              dark: {
                backgroundColor: env.brandSplashBackgroundDark,
                image: brandAsset("splash.png"),
              },
            }
          : {}),
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
