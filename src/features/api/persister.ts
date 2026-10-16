import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import Constants from "expo-constants";
import { createMMKV } from "react-native-mmkv";

/**
 * The query cache on disk. Its own MMKV instance rather than `LocalValue`'s:
 * the cache is one large blob written often, and clearing it must never
 * touch the app's own settings.
 */
const store = createMMKV({ id: "query-cache" });

export const queryPersister = createSyncStoragePersister({
  storage: {
    getItem: (key) => store.getString(key) ?? null,
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => {
      store.remove(key);
    },
  },
  // Many queries can settle at once; write the cache at most once a second.
  throttleTime: 1_000,
});

/**
 * Changing this discards the whole persisted cache on next launch. Tied to
 * the app version, so an update never feeds old response shapes to new code.
 */
export const CACHE_BUSTER = Constants.expoConfig?.version ?? "0";

/** Drops everything on disk — for sign-out, so no user's data outlives them. */
export function clearPersistedCache(): void {
  store.clearAll();
}
