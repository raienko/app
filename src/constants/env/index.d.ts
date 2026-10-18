declare const env: {
  readonly appName: string;
  readonly appSlug: string;
  readonly appScheme: string;
  readonly appBundleId: string;
  readonly projectId: string | undefined;
  readonly appLinkDomains: readonly string[];
  /** Base URL of the backend API, without a trailing slash; unset until a brand has one. */
  readonly apiUrl: string | undefined;
  /** Hex colour behind the Android adaptive icon's foreground. */
  readonly brandIconBackground: string;
  /** Hex colour behind the splash image. */
  readonly brandSplashBackground: string;
  /** Hex colour behind the splash image in dark mode; unset reuses the light one. */
  readonly brandSplashBackgroundDark: string | undefined;
  /** TileJSON URL of an OpenMapTiles-schema vector source; unset uses the default provider. */
  readonly mapTilesUrl: string | undefined;
  /** Label-font URL template with `{fontstack}` and `{range}`; unset uses the default provider. */
  readonly mapGlyphsUrl: string | undefined;
  /** A build made for end-to-end tests (`EXPO_PUBLIC_E2E=1`). Use `isE2E` from @/utils. */
  readonly e2e: boolean;
};

export type Env = typeof env;

export default env;
