import type { ConfigContext, ExpoConfig } from "expo/config";

// Imported via require: Expo transpiles only this entry file when loading
// app.config.ts, so a relative *.ts import can't be resolved here —
// constants/env/index.js (typed by the sibling index.d.ts) is required
// directly instead. Plain `require` returns module.exports as-is (the env
// object itself), matching its default export.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- see comment above
const env = require("./src/constants/env");
const storybookEnabled = process.env.STORYBOOK_ENABLED === "true";

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
  icon: "./assets/images/icon.png",
  userInterfaceStyle: "automatic",
  ios: {
    ...config.ios,
    bundleIdentifier: env.appBundleId,
    icon: "./assets/expo.icon",
    ...iosAppLinks,
  },
  android: {
    ...config.android,
    package: env.appBundleId,
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    predictiveBackGestureEnabled: false,
    ...androidAppLinks,
  },
  web: {
    output: "single",
    favicon: "./assets/images/favicon.png",
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
        backgroundColor: "#208AEF",
        image: "./assets/images/splash-icon.png",
        imageWidth: 76,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
