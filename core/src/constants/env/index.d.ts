declare const env: {
  readonly appName: string;
  readonly appSlug: string;
  readonly appScheme: string;
  readonly appBundleId: string;
  readonly projectId: string | undefined;
  readonly appLinkDomains: readonly string[];
};

export type Env = typeof env;

export default env;
