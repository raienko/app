import type { ConfigContext, ExpoConfig } from "expo/config";

// Imported via require: Expo transpiles only this entry file when loading
// app.config.ts, so a relative *.ts import can't be resolved here —
// constants/env/index.js (typed by the sibling index.d.ts) is required
// directly instead. Plain `require` returns module.exports as-is (the env
// object itself), matching its default export.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- see comment above
const env = require("./src/constants/env");
const storybookEnabled = process.env.STORYBOOK_ENABLED === "true";

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
  },
  web: {
    output: "static",
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
