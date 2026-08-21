import type { ReactNode } from "react";

import Providers from "./providers";

export { default as Providers } from "./providers";

type Props = {
  children: ReactNode;
};

/**
 * Wraps the router (mounted once, in src/app/_layout.tsx). This is the single
 * place for:
 * - context providers every screen needs — see providers.tsx
 * - global overlay UI rendered above the current screen (toasts, modals, ...)
 * - global listeners/services that should run for the lifetime of the app
 *   (analytics init, push notification listeners, app-state listeners, ...) —
 *   set those up here via useEffect once there's a concrete one to add.
 */
export default function Root({ children }: Props) {
  return (
    <Providers>
      {children}

      {/* Global overlay UI goes here, e.g. <Toast />. */}
    </Providers>
  );
}
