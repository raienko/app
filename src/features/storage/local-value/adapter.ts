import { createMMKV, useMMKVString } from "react-native-mmkv";

import type { StorageAdapter } from "../types";

/**
 * One adapter for every platform. `react-native-mmkv` ships its own web
 * implementation (`createMMKV.web.ts`, backed by `localStorage` with keys
 * namespaced by this `id`), so the bundler's platform resolution swaps it
 * in and there's nothing for this file to branch on — no `.web.ts` twin,
 * and one code path to reason about.
 *
 * What *is* web-specific is what happens when `localStorage` is
 * unavailable: MMKV silently falls back to an in-memory store, so writes
 * appear to work and then vanish on reload. That's surfaced by
 * `isStoragePersistent()` (../persistence) rather than handled here —
 * nothing this adapter can do makes the data persist, so the honest move
 * is to let the app tell the user.
 */
const mmkv = createMMKV({ id: "local-storage" });

const localStorageAdapter: StorageAdapter = {
  getItem: (key) => mmkv.getString(key),
  setItem: (key, value) => mmkv.set(key, value),
  removeItem: (key) => {
    mmkv.remove(key);
  },
  // useMMKVString subscribes to just this key, instead of a generic
  // "any key changed" listener re-checked in JS on every change.
  useValue: (key) => useMMKVString(key, mmkv)[0],
};

export default localStorageAdapter;
