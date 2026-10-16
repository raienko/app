import { QueryClient } from "@tanstack/react-query";

import { days, seconds } from "@/utils";

import { isApiError } from "./errors";

/** How long cached data is kept, in memory and on disk. */
export const CACHE_TIME = days(1);

/**
 * Retry what might work a second time — a dropped connection, a timeout,
 * a server error — but never a 4xx: the same request will be refused the
 * same way, and a 401 retried three times is three forced logouts.
 */
export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= 2) return false;
  if (!isApiError(error)) return true;
  if (error.isCancelled) return false;
  return error.status === undefined || error.status >= 500;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetry,
        // Fresh for 30s: switching screens back and forth doesn't refetch.
        staleTime: seconds(30),
        // Kept as long as it's persisted, or a restored entry would be
        // garbage-collected before anything reads it.
        gcTime: CACHE_TIME,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/** The app's single client. Exported for cache work outside React (e.g. sign-out). */
export const queryClient = createQueryClient();
