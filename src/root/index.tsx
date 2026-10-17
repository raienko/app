import { useSyncExternalStore, type ReactNode } from "react";

import { DevMenu } from "@/features/dev-menu";
import { WebApp } from "@/features/web-app";
import { isWeb } from "@/utils";

import Providers from "./providers";
import withObserve from "./with-observe";
import type { ProvidersConfig } from "./providers";

export { default as Providers } from "./providers";
export type { ProvidersConfig } from "./providers";

export type RootConfig = ProvidersConfig;

type Props = {
  children: ReactNode;
  /** Provider-specific app configuration; omitted values keep core defaults. */
  config?: RootConfig;
};

/**
 * Wraps the router (mounted once, in src/app/_layout.tsx). This is the single
 * place for:
 * - context providers every screen needs — see providers.tsx
 * - global overlay UI rendered above the current screen. Toasts already
 *   have theirs (`ToastsProvider`, in providers.tsx, so stories and tests
 *   get it too); this is the place for overlay UI the real app alone needs.
 * - global listeners/services that should run for the lifetime of the app
 *   (analytics init, push notification listeners, app-state listeners, ...) —
 *   set those up here via useEffect once there's a concrete one to add.
 *   Ones that Storybook and Jest should get too go in providers.tsx
 *   instead, next to `Permissions` and `DeepLinks`.
 */
const subscribeNothing = () => () => {};

/**
 * `false` on the server and during hydration, `true` once in the browser —
 * and always `true` on iOS and Android, which have no server render.
 */
function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => !isWeb,
  );
}

function Root({ children, config }: Props) {
  // The web build has server output so src/app can hold API routes, which
  // means every page is also rendered in Node first. The app reads
  // localStorage, window and the like while rendering, so the server and
  // the first browser render both draw an empty page, and the app mounts
  // right after — the same empty shell a single-page build served.
  const isClient = useIsClient();
  if (!isClient) return null;

  return (
    <Providers config={config}>
      {children}
      <WebApp />
      <DevMenu />

      {/* Global overlay UI the real app alone needs goes here. */}
    </Providers>
  );
}

export default withObserve(Root);
