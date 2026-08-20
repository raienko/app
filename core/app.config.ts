import type { ConfigContext, ExpoConfig } from "expo/config";

// Imported via require: Expo transpiles only this entry file when loading
// app.config.ts, so a relative *.ts import can't be resolved here —
// constants/env/index.js (typed by the sibling index.d.ts) is required
// directly instead. Plain `require` returns module.exports as-is (the env
// object itself), matching its default export.
const env = require("./src/constants/env");

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
  plugins: [
    "expo-router",
    "@react-native-community/datetimepicker",
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
