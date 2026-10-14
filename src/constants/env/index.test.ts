/**
 * The env module reads `process.env` once, at import. So each case sets the
 * variables it wants and re-imports through `jest.isolateModules`, rather
 * than calling a function — which is also exactly how the app loads it, and
 * therefore what is worth testing.
 */
const VALID = {
  EXPO_PUBLIC_APP_NAME: "app",
  EXPO_PUBLIC_APP_SLUG: "app",
  EXPO_PUBLIC_APP_SCHEME: "app",
  EXPO_PUBLIC_APP_BUNDLE_ID: "com.example.app",
  EXPO_PUBLIC_BRAND_ICON_BACKGROUND: "#E6F4FE",
  EXPO_PUBLIC_BRAND_SPLASH_BACKGROUND: "#208AEF",
};

type Env = typeof import("./index").default;

function load(overrides: Record<string, string | undefined> = {}): Env {
  const previous = { ...process.env };
  Object.assign(process.env, VALID, overrides);
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) delete process.env[key];
  }

  let env: Env;
  try {
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports -- the module is the thing under test, and it has to be re-required per case
      env = require("./index") as Env;
    });
  } finally {
    process.env = previous;
  }

  return env!;
}

describe("env", () => {
  it("reads the required values", () => {
    const env = load();

    expect(env.appName).toBe("app");
    expect(env.appBundleId).toBe("com.example.app");
  });

  it("splits the link domains, dropping blanks and stray spaces", () => {
    expect(
      load({ EXPO_PUBLIC_APP_LINK_DOMAINS: " a.com , ,b.com " }).appLinkDomains,
    ).toEqual(["a.com", "b.com"]);
  });

  it("throws for a missing required value", () => {
    expect(() => load({ EXPO_PUBLIC_APP_NAME: undefined })).toThrow(
      /EXPO_PUBLIC_APP_NAME/,
    );
  });

  /**
   * These two are read at prebuild and written straight into the native
   * projects, so a malformed value doesn't fail here — it fails later in
   * Gradle or Xcode, complaining about something else.
   */
  describe("brand colours", () => {
    it("reads both", () => {
      const env = load();

      expect(env.brandIconBackground).toBe("#E6F4FE");
      expect(env.brandSplashBackground).toBe("#208AEF");
    });

    it.each(["#fff", "#FFF", "#208AEF", "#208aef"])("accepts %s", (value) => {
      expect(
        load({ EXPO_PUBLIC_BRAND_SPLASH_BACKGROUND: value })
          .brandSplashBackground,
      ).toBe(value);
    });

    it("trims surrounding whitespace", () => {
      expect(
        load({ EXPO_PUBLIC_BRAND_SPLASH_BACKGROUND: "  #208AEF  " })
          .brandSplashBackground,
      ).toBe("#208AEF");
    });

    it.each([
      ["a name", "blue"],
      ["a bare hex with no hash", "208AEF"],
      ["rgb()", "rgb(32, 138, 239)"],
      ["too few digits", "#20"],
      ["five digits", "#208AE"],
      ["non-hex characters", "#20ZZEF"],
    ])("refuses %s", (_name, value) => {
      expect(() =>
        load({ EXPO_PUBLIC_BRAND_SPLASH_BACKGROUND: value }),
      ).toThrow(/must be a 3- or 6-digit hex colour/);
    });

    /**
     * `#RRGGBBAA` on the web, `#AARRGGBB` on Android — the same string would
     * be two different colours depending on who read it, so it is refused
     * rather than silently meaning one of them.
     */
    it("refuses eight-digit hex, which is ambiguous across platforms", () => {
      expect(() =>
        load({ EXPO_PUBLIC_BRAND_SPLASH_BACKGROUND: "#208AEFFF" }),
      ).toThrow(/must be a 3- or 6-digit hex colour/);
    });

    // An unquoted `#` starts a comment in a .env file, so the value reads
    // as empty while the line sits there looking perfectly correct.
    it("explains the quoting trap when the value is empty", () => {
      expect(() =>
        load({ EXPO_PUBLIC_BRAND_SPLASH_BACKGROUND: undefined }),
      ).toThrow(/must be quoted/);
    });
  });

  describe("map tiles", () => {
    it("is optional", () => {
      const env = load();
      expect(env.mapTilesUrl).toBeUndefined();
      expect(env.mapGlyphsUrl).toBeUndefined();
    });

    it("reads https URLs", () => {
      const env = load({
        EXPO_PUBLIC_MAP_TILES_URL: "https://tiles.example.com/v3.json?key=k",
        EXPO_PUBLIC_MAP_GLYPHS_URL:
          "https://tiles.example.com/fonts/{fontstack}/{range}.pbf",
      });
      expect(env.mapTilesUrl).toBe("https://tiles.example.com/v3.json?key=k");
    });

    it("refuses plain http", () => {
      expect(() =>
        load({ EXPO_PUBLIC_MAP_TILES_URL: "http://tiles.example.com" }),
      ).toThrow(/EXPO_PUBLIC_MAP_TILES_URL/);
    });

    it("refuses a glyphs URL without the engine's placeholders", () => {
      expect(() =>
        load({
          EXPO_PUBLIC_MAP_GLYPHS_URL: "https://tiles.example.com/fonts.pbf",
        }),
      ).toThrow(/\{fontstack\}/);
    });
  });
});
