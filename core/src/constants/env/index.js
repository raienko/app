/**
 * Plain JS (typed via the sibling index.d.ts) so this file can be `require`d
 * as-is from app.config.ts, which Expo only transpiles as a single entry
 * file and cannot resolve local .ts imports for.
 *
 * Only EXPO_PUBLIC_-prefixed vars are inlined by Metro into the iOS/Android/
 * Web bundle. Node (app.config.ts) reads process.env directly regardless of
 * prefix, so the same file works unmodified in both places.
 */
// process.env.EXPO_PUBLIC_X must stay a static property access (not
// process.env[key]) below — Metro's inliner only replaces literal
// `process.env.NAME` text it can find via static analysis; a dynamic key
// can't be inlined and would be undefined in native/production bundles.
// ESLint enforces this via expo/no-dynamic-env-var.
function required(key, value) {
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(value) {
  const normalized = value?.trim();
  return normalized || undefined;
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
  projectId: optional(process.env.EXPO_PUBLIC_EAS_PROJECT_ID),
};

module.exports = env;
