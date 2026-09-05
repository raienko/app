declare const env: {
  readonly appName: string;
  readonly appSlug: string;
  readonly appScheme: string;
  readonly appBundleId: string;
  readonly projectId: string | undefined;
  readonly appLinkDomains: readonly string[];
  /** Hex colour behind the Android adaptive icon's foreground. */
  readonly brandIconBackground: string;
  /** Hex colour behind the splash image. */
  readonly brandSplashBackground: string;
};

export type Env = typeof env;

export default env;
