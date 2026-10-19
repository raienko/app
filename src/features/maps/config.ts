import env from "@/constants/env";

/**
 * OpenFreeMap — free, no account and no key, OpenStreetMap data in the
 * OpenMapTiles schema the app's style is written against. The default until
 * EXPO_PUBLIC_MAP_TILES_URL / EXPO_PUBLIC_MAP_GLYPHS_URL point elsewhere
 * (see .env.example). The web build's CSP allows this host too
 * (src/features/security-headers) — change both together.
 */
const DEFAULT_TILES_URL = "https://tiles.openfreemap.org/planet";
const DEFAULT_GLYPHS_URL =
  "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf";

export type MapTilesConfig = {
  /** TileJSON URL of an OpenMapTiles-schema vector source. */
  tilesUrl: string;
  /** Label fonts, with `{fontstack}` and `{range}` for the engine to fill in. */
  glyphsUrl: string;
};

export const mapTiles: MapTilesConfig = {
  tilesUrl: env.mapTilesUrl ?? DEFAULT_TILES_URL,
  glyphsUrl: env.mapGlyphsUrl ?? DEFAULT_GLYPHS_URL,
};

/**
 * The one font the style asks for. Every OpenMapTiles-compatible provider
 * serves it, so switching providers doesn't mean editing the style.
 */
export const MAP_FONT = "Noto Sans Regular";
