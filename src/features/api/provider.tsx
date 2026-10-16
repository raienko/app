import type { Query } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import type { ReactNode } from "react";

import { CACHE_BUSTER, queryPersister } from "./persister";
import { CACHE_TIME, queryClient } from "./query-client";

type Props = {
  children: ReactNode;
};

/**
 * Only successful results are written to disk, and a query can opt out with
 * `meta: { persist: false }` — anything too sensitive to leave on the device
 * between launches.
 */
function shouldPersist(query: Query): boolean {
  return query.state.status === "success" && query.meta?.persist !== false;
}

/**
 * TanStack Query for the whole app, with its cache persisted to MMKV, so a
 * relaunch shows the last data at once and refetches behind it. Mounted
 * once in `src/root/providers.tsx`.
 */
export default function ApiProvider({ children }: Props) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: queryPersister,
        maxAge: CACHE_TIME,
        buster: CACHE_BUSTER,
        dehydrateOptions: { shouldDehydrateQuery: shouldPersist },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
