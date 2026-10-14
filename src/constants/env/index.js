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

/**
 * A required var that has to be a hex colour, because the two places these
 * are used — the Android adaptive icon's plate and the splash background —
 * are read at prebuild and written straight into the native projects. A
 * malformed value there doesn't fail here, it fails later in Gradle or
 * Xcode with a message about something else entirely.
 *
 * Three- and six-digit hex only. Eight-digit is deliberately refused: it
 * means `#RRGGBBAA` on the web and `#AARRGGBB` on Android, so the same
 * string would produce two different colours depending on who read it.
 */
function color(key, value) {
  const normalized = value?.trim();
  if (!normalized) {
    // Its own message rather than `required`'s, because for a colour the
    // overwhelmingly likely cause is a value written without quotes: `#`
    // starts a comment in a .env file, so `KEY=#208AEF` reads as empty and
    // the line is sitting right there looking correct.
    throw new Error(
      `Missing required environment variable: ${key}. Hex colours must be quoted in .env ("#208AEF"), or the # is read as a comment.`,
    );
  }
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(normalized)) {
    throw new Error(
      `Environment variable ${key} must be a 3- or 6-digit hex colour (e.g. "#208AEF"), got: ${normalized}`,
    );
  }
  return normalized;
}

/**
 * An optional https URL. Map tiles and glyphs are fetched by the native map
 * engine and the browser alike, and both refuse plain http on a release
 * build — so a mistyped scheme is caught here rather than as a blank map.
 * `mustContain` names placeholders the engine fills in itself.
 */
function httpsUrl(key, value, mustContain = []) {
  const normalized = optional(value);
  if (normalized === undefined) return undefined;
  if (!/^https:\/\/\S+$/.test(normalized)) {
    throw new Error(
      `Environment variable ${key} must be an https:// URL, got: ${normalized}`,
    );
  }
  for (const placeholder of mustContain) {
    if (!normalized.includes(placeholder)) {
      throw new Error(
        `Environment variable ${key} must contain ${placeholder}, which the map fills in per request.`,
      );
    }
  }
  return normalized;
}

/** A comma-separated var as a list, with blanks and stray spaces dropped. */
function list(value) {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
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
  // Domains this app is allowed to open universal links (iOS) and app links
  // (Android) for. Read twice: app.config.ts turns them into the native
  // associated-domain/intent-filter entries that make the OS deliver those
  // links here at all, and @/features/deep-links checks incoming URLs
  // against them so a link for someone else's site opens in the browser.
  appLinkDomains: list(process.env.EXPO_PUBLIC_APP_LINK_DOMAINS),
  // The two surfaces the OS paints for us, before any of this app's own
  // code runs: the plate an Android adaptive icon's foreground sits on, and
  // the splash background behind the launch image. They live here rather
  // than in theme/palette.json because nothing in the app ever draws them —
  // they are baked into the native projects at prebuild, and the app is not
  // running yet when they are on screen. Both pair with a file in
  // assets/brand, so a rebrand is those files plus these two values.
  brandIconBackground: color(
    "EXPO_PUBLIC_BRAND_ICON_BACKGROUND",
    process.env.EXPO_PUBLIC_BRAND_ICON_BACKGROUND,
  ),
  brandSplashBackground: color(
    "EXPO_PUBLIC_BRAND_SPLASH_BACKGROUND",
    process.env.EXPO_PUBLIC_BRAND_SPLASH_BACKGROUND,
  ),
  // Where `Map` gets its vector tiles and label fonts. Both optional: unset,
  // @/features/maps falls back to OpenFreeMap, which needs no key. Public
  // like every EXPO_PUBLIC_ value — a provider key in here ships in the app,
  // so restrict it to this app's bundle id and web domains on the provider.
  mapTilesUrl: httpsUrl(
    "EXPO_PUBLIC_MAP_TILES_URL",
    process.env.EXPO_PUBLIC_MAP_TILES_URL,
  ),
  mapGlyphsUrl: httpsUrl(
    "EXPO_PUBLIC_MAP_GLYPHS_URL",
    process.env.EXPO_PUBLIC_MAP_GLYPHS_URL,
    ["{fontstack}", "{range}"],
  ),
};

module.exports = env;
