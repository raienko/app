import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import sharp from "sharp";

import { HEX } from "./color.ts";

export type Brand = {
  /** assets/brand — the brand's source files. */
  dir: string;
  logoPath: string;
  name: string;
  slug: string;
  scheme: string;
  bundleId: string;
  easProjectId: string;
  appLinkDomains: string[];
  /** The backend the request client talks to; empty when there's none yet. */
  apiUrl: string;
  colors: {
    primary: string;
    iconBackground: string;
    splashBackground: string;
    splashBackgroundDark?: string;
  };
  palette?: { light?: Record<string, string>; dark?: Record<string, string> };
};

export class BrandError extends Error {}

const BUNDLE_ID = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9_]*)+$/i;
const SCHEME = /^[a-z][a-z0-9+.-]*$/;
const SLUG = /^[a-z0-9-]+$/;

/**
 * Reads and checks the brand in `dir`. Every problem is collected and
 * reported at once, so fixing a brand isn't one run per typo.
 */
export async function loadBrand(dir: string): Promise<Brand> {
  const label = "assets/brand";
  if (!existsSync(join(dir, "brand.json"))) {
    throw new BrandError(
      `${label}/brand.json is missing — see ${label}/README.md.`,
    );
  }

  let raw: Partial<Brand>;
  try {
    raw = JSON.parse(readFileSync(join(dir, "brand.json"), "utf8"));
  } catch (error) {
    throw new BrandError(
      `${label}/brand.json isn't valid JSON: ${(error as Error).message}`,
    );
  }

  const problems: string[] = [];
  const text = (key: keyof Brand, pattern?: RegExp, hint?: string) => {
    const value = raw[key];
    if (typeof value !== "string" || value.trim() === "") {
      problems.push(`"${key}" is required`);
    } else if (pattern && !pattern.test(value)) {
      problems.push(`"${key}" ${hint}, got "${value}"`);
    }
  };

  text("name");
  text("slug", SLUG, "must be lowercase letters, digits and dashes");
  text("scheme", SCHEME, "must be a lowercase URL scheme");
  text("bundleId", BUNDLE_ID, "must be reverse-DNS, like com.acme.app");

  if (
    raw.apiUrl !== undefined &&
    raw.apiUrl !== "" &&
    !/^https:\/\/\S+$|^http:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2)(:\d+)?(\/\S*)?$/.test(
      raw.apiUrl,
    )
  ) {
    problems.push(
      `"apiUrl" must be an https:// URL (plain http only for localhost), got "${raw.apiUrl}"`,
    );
  }

  const colors = (raw.colors ?? {}) as Partial<Brand["colors"]>;
  for (const key of [
    "primary",
    "iconBackground",
    "splashBackground",
  ] as const) {
    if (!colors[key] || !HEX.test(colors[key]!)) {
      problems.push(`"colors.${key}" must be a 3- or 6-digit hex colour`);
    }
  }
  if (
    colors.splashBackgroundDark !== undefined &&
    !HEX.test(colors.splashBackgroundDark)
  ) {
    problems.push(
      `"colors.splashBackgroundDark" must be a 3- or 6-digit hex colour`,
    );
  }

  for (const [scheme, values] of Object.entries(raw.palette ?? {})) {
    for (const [key, value] of Object.entries(values ?? {})) {
      // `pressed` and `overlay` are translucent by design; everything else
      // in the palette is plain hex.
      if (!HEX.test(value) && !/^rgba\(/.test(value)) {
        problems.push(
          `"palette.${scheme}.${key}" must be a hex colour, got "${value}"`,
        );
      }
    }
  }

  const logoPath = ["logo.svg", "logo.png"]
    .map((file) => join(dir, file))
    .find((file) => existsSync(file));
  if (!logoPath) {
    problems.push("a logo.svg or logo.png is required");
  } else {
    const {
      width = 0,
      height = 0,
      hasAlpha,
    } = await sharp(logoPath).metadata();
    if (logoPath.endsWith(".png")) {
      if (width !== height)
        problems.push(`logo.png must be square, got ${width}×${height}`);
      if (width < 1024)
        problems.push(`logo.png must be at least 1024px, got ${width}px`);
      if (!hasAlpha) problems.push("logo.png needs a transparent background");
    }
  }

  if (problems.length > 0) {
    throw new BrandError(`${label} has problems:\n  ${problems.join("\n  ")}`);
  }

  return {
    ...(raw as Brand),
    dir,
    logoPath: logoPath!,
    easProjectId: raw.easProjectId ?? "",
    appLinkDomains: raw.appLinkDomains ?? [],
    apiUrl: raw.apiUrl ?? "",
  };
}
