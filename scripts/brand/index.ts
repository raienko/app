/**
 * Applies the brand in assets/brand (brand.json + logo) to the app:
 *
 *   yarn brand
 *
 * Writes the generated, gitignored outputs — assets/brand/generated/*,
 * src/features/theme/palette.json — and the brand's keys in .env. Runs on
 * every `yarn install` (postinstall), so a fresh clone or a CI runner always
 * has a complete brand. Rebranding is replacing assets/brand and running it
 * again. See assets/brand/README.md.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { contrast } from "./color.ts";
import { writeEnv } from "./env.ts";
import { checkOverrides, writeImages } from "./images.ts";
import { buildPalette, type Palettes } from "./palette.ts";
import { BrandError, loadBrand } from "./resolve.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const paths = {
  brand: join(root, "assets", "brand"),
  env: join(root, ".env"),
  envExample: join(root, ".env.example"),
  generated: join(root, "assets", "brand", "generated"),
  paletteBase: join(root, "src", "features", "theme", "palette.base.json"),
  palette: join(root, "src", "features", "theme", "palette.json"),
};

async function main() {
  const brand = await loadBrand(paths.brand);

  const sizeProblems = await checkOverrides(brand);
  if (sizeProblems.length > 0) {
    throw new BrandError(
      `assets/brand has problems:\n  ${sizeProblems.join("\n  ")}`,
    );
  }

  const base = JSON.parse(readFileSync(paths.paletteBase, "utf8")) as Palettes;
  const palette = buildPalette(base, brand.colors.primary, brand.palette);

  const previousBundleId = existsSync(paths.env)
    ? readFileSync(paths.env, "utf8").match(
        /^EXPO_PUBLIC_APP_BUNDLE_ID="?([^"\n]*)/m,
      )?.[1]
    : undefined;

  const images = await writeImages(brand, paths.generated);
  writeFileSync(paths.palette, `${JSON.stringify(palette, null, 2)}\n`);
  writeEnv(brand, paths.env, paths.envExample);

  const ratio = (fg: string, bg: string) => contrast(fg, bg).toFixed(1);
  console.log(`Brand: ${brand.name} (${brand.bundleId})`);
  for (const { file, source } of images) {
    console.log(`  ${source === "brand" ? "override " : "generated"}  ${file}`);
  }
  for (const scheme of ["light", "dark"] as const) {
    const p = palette[scheme];
    console.log(
      `  ${scheme.padEnd(5)} primary ${p.primary} (label ${ratio(p.onPrimary!, p.primary!)}:1)` +
        `  accent ${p.accent} (on page ${ratio(p.accent!, p.background!)}:1)`,
    );
  }
  console.log(
    `  wrote ${relative(root, paths.generated)}/, ${relative(root, paths.palette)}, .env`,
  );

  const nativeDirs = ["ios", "android"].filter((dir) =>
    existsSync(join(root, dir)),
  );
  if (nativeDirs.length > 0 && previousBundleId !== brand.bundleId) {
    console.log(
      `\n  ${nativeDirs.join("/")} was generated for another bundle id — run \`npx expo prebuild --clean\`.`,
    );
  } else if (nativeDirs.length > 0) {
    console.log(
      `\n  Icons and splash are baked into ${nativeDirs.join("/")} at prebuild — run \`npx expo prebuild --clean\` to pick up changes.`,
    );
  }
}

main().catch((error: unknown) => {
  console.error(
    error instanceof BrandError || error instanceof Error
      ? `\nyarn brand: ${error.message}\n`
      : error,
  );
  process.exit(1);
});
