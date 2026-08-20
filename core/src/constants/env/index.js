/**
 * Plain JS (typed via the sibling index.d.ts) so this file can be `require`d
 * as-is from app.config.ts, which Expo only transpiles as a single entry
 * file and cannot resolve local .ts imports for.
 *
 * Only EXPO_PUBLIC_-prefixed vars are inlined by Metro into the iOS/Android/
 * Web bundle. Node (app.config.ts) reads process.env directly regardless of
 * prefix, so the same file works unmodified in both places.
 */
function getEnv(key, required) {
  const value = process.env[key];
  if (required && (!value || value.trim() === "")) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const env = {
  appName: getEnv("EXPO_PUBLIC_APP_NAME", true),
  appSlug: getEnv("EXPO_PUBLIC_APP_SLUG", true),
  appScheme: getEnv("EXPO_PUBLIC_APP_SCHEME", true),
  appBundleId: getEnv("EXPO_PUBLIC_APP_BUNDLE_ID", true),
};

module.exports = env;
