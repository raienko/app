import type { ConfigContext, ExpoConfig } from "expo/config";

// Imported via require: Expo transpiles only this entry file when loading
// app.config.ts, so a relative *.ts import can't be resolved here —
// constants/env/index.js (typed by the sibling index.d.ts) is required
// directly instead. Plain `require` returns module.exports as-is (the env
// object itself), matching its default export.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- see comment above
const env = require("./src/constants/env");
const storybookEnabled = process.env.STORYBOOK_ENABLED === "true";

/**
 * Everything that carries the app's identity — the icons, the splash, the
 * favicon — lives in one directory, so a rebrand is a matter of replacing
 * the contents of `assets/brand` rather than hunting the files that happen
 * to be branding among the ones that happen not to be.
 *
 * `assets/images` keeps what a *screen* draws; nothing under here is
 * imported by the app at runtime. The two are separate for that reason
 * rather than by file type: these paths are read by Expo at config time and
 * baked into the native projects, while the others go through Metro.
 */
const BRAND_DIR = "./assets/brand";

/**
 * A path under `assets/brand`, relative to the project root, which is what
 * every Expo config field here expects.
 *
 * A helper rather than the literal seven times over: the directory name
 * appears once, so moving it is one edit, and a typo in a path that Expo
 * only reads at prebuild time is otherwise the kind of mistake that surfaces
 * as a missing icon on a build machine.
 */
const brandAsset = (file: string): string => `${BRAND_DIR}/${file}`;

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

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: env.appName,
  slug: env.appSlug,
  scheme: env.appScheme,
  version: "0.0.1",
  orientation: "portrait",
  icon: brandAsset("icon.png"),
  userInterfaceStyle: "automatic",
  ios: {
    ...config.ios,
    bundleIdentifier: env.appBundleId,
    // Apple's Icon Composer bundle, which iOS uses in preference to the
    // flat `icon` above where it is supported.
    icon: brandAsset("app.icon"),
    ...iosAppLinks,
  },
  android: {
    ...config.android,
    package: env.appBundleId,
    adaptiveIcon: {
      backgroundColor: env.brandIconBackground,
      foregroundImage: brandAsset("android-icon-foreground.png"),
      backgroundImage: brandAsset("android-icon-background.png"),
      monochromeImage: brandAsset("android-icon-monochrome.png"),
    },
    predictiveBackGestureEnabled: false,
    ...androidAppLinks,
  },
  web: {
    output: "single",
    favicon: brandAsset("favicon.png"),
  },
  extra: {
    ...config.extra,
    eas: {
      ...config.extra?.eas,
      projectId: env.projectId || 0,
    },
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
        image: brandAsset("splash-icon.png"),
        imageWidth: 76,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
