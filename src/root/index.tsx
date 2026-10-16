import type { ReactNode } from "react";

import { WebApp } from "@/features/web-app";

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
function Root({ children, config }: Props) {
  return (
    <Providers config={config}>
      {children}
      <WebApp />

      {/* Global overlay UI the real app alone needs goes here. */}
    </Providers>
  );
}

export default withObserve(Root);
