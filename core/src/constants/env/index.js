/**
 * Plain JS (typed via the sibling index.d.ts) so this file can be `require`d
 * as-is from app.config.ts, which Expo only transpiles as a single entry
 * file and cannot resolve local .ts imports for.
 *
 * Only EXPO_PUBLIC_-prefixed vars are inlined by Metro into the iOS/Android/
 * Web bundle. Node (app.config.ts) reads process.env directly regardless of
 * prefix, so the same file works unmodified in both places.
 */
function required(name, value) {
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const env = {
  appName: required("EXPO_PUBLIC_APP_NAME", process.env.EXPO_PUBLIC_APP_NAME),
  appSlug: required("EXPO_PUBLIC_APP_SLUG", process.env.EXPO_PUBLIC_APP_SLUG),
  appScheme: required(
    "EXPO_PUBLIC_APP_SCHEME",
    process.env.EXPO_PUBLIC_APP_SCHEME,
  ),
  appBundleId: required(
    "EXPO_PUBLIC_APP_BUNDLE_ID",
    process.env.EXPO_PUBLIC_APP_BUNDLE_ID,
  ),
};

module.exports = env;
