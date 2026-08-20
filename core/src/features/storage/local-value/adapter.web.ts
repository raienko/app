import { useSyncExternalStore } from "react";

import type { StorageAdapter } from "../types";

// Expo web can prerender routes in a static-export/SSR pass where `window`
// doesn't exist yet; fall back to an in-memory store so the module doesn't
// crash on import, and pick up real localStorage once it's available.
const memoryStore = new Map<string, string>();

function getStore(): Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return {
    getItem: (key) => memoryStore.get(key) ?? null,
    setItem: (key, value) => {
      memoryStore.set(key, value);
    },
    removeItem: (key) => {
      memoryStore.delete(key);
    },
  };
}

const listenersByKey = new Map<string, Set<() => void>>();

function notify(key: string) {
  listenersByKey.get(key)?.forEach((listener) => listener());
}

function subscribe(key: string, onChange: () => void) {
  let listeners = listenersByKey.get(key);
  if (!listeners) {
    listeners = new Set();
    listenersByKey.set(key, listeners);
  }
  listeners.add(onChange);
  return () => listeners?.delete(onChange);
}

const localStorageAdapter: StorageAdapter = {
  getItem: (key) => getStore().getItem(key) ?? undefined,
  setItem: (key, value) => {
    getStore().setItem(key, value);
    notify(key);
  },
  removeItem: (key) => {
    getStore().removeItem(key);
    notify(key);
  },
  useValue: (key) =>
    useSyncExternalStore(
      (onChange) => subscribe(key, onChange),
      () => getStore().getItem(key) ?? undefined,
    ),
};

export default localStorageAdapter;
