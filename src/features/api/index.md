[Docs](../../../docs/index.md) › [Features](../../../docs/features/index.md) › App services

# API

> `api` for every backend request, and TanStack Query with its cache persisted to MMKV.

<sub>`src/features/api` · Tests: [`client.test.ts`](client.test.ts), [`query-client.test.ts`](query-client.test.ts)</sub>

```ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/features/api";

const user = await api.get<User>("/me");
await api.post("/posts", { title });

useQuery({
  queryKey: ["me"],
  queryFn: ({ signal }) => api.get<User>("/me", { signal }),
});
```

`api.get`/`post`/`put`/`patch`/`delete` resolve with the response body and reject with an `ApiError`. Pass TanStack Query's `signal` through so leaving a screen cancels its requests.

## The request client

**axios, not react-native-nitro-fetch.** Everything this layer does is what axios interceptors are for, and it runs unchanged on the web, in Storybook and in Jest, with no native module to rebuild. If raw throughput ever matters, axios can be pointed at another fetch implementation (`adapter: "fetch"` with `env.fetch`), so nitro-fetch can slot in without touching a call site.

- **Base URL** comes from the brand: `apiUrl` in `assets/brand/brand.json` → `EXPO_PUBLIC_API_URL` → `env.apiUrl`. It must be `https`, except plain `http` to a local dev server (`localhost`, or `10.0.2.2`, the Android emulator's name for the host machine). Timeout is 15 seconds.
- **Paths and absolute URLs.** A path (`"users/1"` or `"/users/1"`) is joined to the base URL. An absolute URL (`"https://cdn.example.org/config.json"`) is used exactly as given. The logging, headers, errors and formatting all still apply, but **the token only goes to the API's own origin**: a third party never sees the user's session, and a third party's `401` never forces a logout.
- **Headers.** Every request sends `Accept: application/json`, `X-App-Version` and `X-Platform`. Anything else that owns a header adds it with `configureApi.addHeaders(() => ({ … }))`, which returns a function that removes it again. A caller's own `headers` always win.
- **The token.** `configureApi.setTokenProvider(() => token)` supplies `Authorization: Bearer …`; the auth feature will set it from a `SecureValue`. A request sent with `{ skipAuth: true }` (sign-in, public endpoints) goes without it.
- **Response formatting.** `configureApi.setResponseFormatter(response => …)` reshapes every successful response, for when the backend wraps payloads (`{ data, meta }`). It returns `response.data` until then.
- **Logging.** Each request is numbered as it leaves (`#1`, `#2`, …), and its response or failure carries the same number, so lines pair up even when responses arrive out of order: `OUT #1 GET /me` … `IN #1 200 GET /me (120ms)`. Requests go to `logger.out` (method, path, params, body) and responses to `logger.in` (status, method, path, duration, body); failures to `logger.failed`. The `Authorization` header is never logged. Pass `{ skipLog: true }` for anything carrying a password. The logger is silent outside `__DEV__`.
- **Errors.** Everything that fails becomes an `ApiError`: `status`, the server's `code` and `message` when its body has them, the raw `data`, and `isNetworkError` / `isTimeout` / `isCancelled`.
- **Forced logout.** When a failure matches the rule (any `401` by default; `configureApi.setForceLogoutRule(error => …)` for a server error code instead), the client raises `apiEvents.on("forceLogout", …)`. Auth will listen and sign the user out; the client itself knows nothing about sign-out. Requests sent with `skipAuth` never raise it, since they carried no session to reject.

## TanStack Query

`<ApiProvider>`, mounted once in `src/root/providers.tsx`, provides one `QueryClient` (also exported as `queryClient`, for cache work outside React).

- **Retries** cover failures a second attempt might fix (no response, a timeout, a 5xx), twice at most. A 4xx is never retried: it'll be refused the same way, and a retried 401 would force the logout three times.
- **Freshness.** Data is fresh for 30 seconds, so moving between screens doesn't refetch, and kept for 24 hours.
- **Persisted to MMKV**, in its own `query-cache` instance, written at most once a second. A relaunch shows the last data at once and refetches behind it. Only successful results are saved, and the cache is discarded when the app version changes, so new code never reads old response shapes.
- **Keeping data off the disk.** `meta: { persist: false }` keeps a query out of it. `clearPersistedCache()` wipes the whole thing; sign-out should call it together with `queryClient.clear()`.
- **Typed errors.** `register.d.ts` tells TanStack Query that errors are `ApiError`s, so `error.status` needs no cast.

---

[All features](../../../docs/features/index.md) · [Docs index](../../../docs/index.md)
