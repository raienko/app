import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";

import type { Brand } from "./resolve.ts";

/**
 * The .env keys a brand owns, in the order they're written. Values are
 * quoted: a bare `#` starts a comment in a .env file, so an unquoted hex
 * colour silently reads as empty.
 */
function brandKeys(brand: Brand): [string, string][] {
  return [
    ["EXPO_PUBLIC_APP_NAME", brand.name],
    ["EXPO_PUBLIC_APP_SLUG", brand.slug],
    ["EXPO_PUBLIC_APP_SCHEME", brand.scheme],
    ["EXPO_PUBLIC_APP_BUNDLE_ID", brand.bundleId],
    ["EXPO_PUBLIC_EAS_PROJECT_ID", brand.easProjectId],
    ["EXPO_PUBLIC_APP_LINK_DOMAINS", brand.appLinkDomains.join(",")],
    ["EXPO_PUBLIC_BRAND_ICON_BACKGROUND", brand.colors.iconBackground],
    ["EXPO_PUBLIC_BRAND_SPLASH_BACKGROUND", brand.colors.splashBackground],
    [
      "EXPO_PUBLIC_BRAND_SPLASH_BACKGROUND_DARK",
      brand.colors.splashBackgroundDark ?? "",
    ],
  ];
}

/**
 * Rewrites the brand's keys in .env and leaves every other line — map tile
 * URLs, comments, anything a developer added — exactly as it was. A missing
 * .env starts as a copy of .env.example, so a fresh clone needs no manual
 * step.
 */
export function writeEnv(brand: Brand, envFile: string, exampleFile: string) {
  if (!existsSync(envFile)) copyFileSync(exampleFile, envFile);

  const keys = brandKeys(brand);
  const pending = new Map(keys);
  const lines = readFileSync(envFile, "utf8").split("\n");

  const updated = lines.map((line) => {
    const key = line.match(/^([A-Z0-9_]+)=/)?.[1];
    if (!key || !pending.has(key)) return line;
    const value = pending.get(key)!;
    pending.delete(key);
    return `${key}="${value}"`;
  });

  // Keys the file didn't have yet (an older .env, a new key) go at the end.
  const missing = keys.filter(([key]) => pending.has(key));
  if (missing.length > 0) {
    if (updated.at(-1) !== "") updated.push("");
    updated.push("# Written by `yarn brand`");
    for (const [key, value] of missing) updated.push(`${key}="${value}"`);
    updated.push("");
  }

  writeFileSync(envFile, updated.join("\n"));
}
