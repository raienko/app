import { useSyncExternalStore } from "react";

type Listener = (key: string) => void;

function createFakeMMKV() {
  const store = new Map<string, string>();
  const listeners = new Set<Listener>();

  return {
    set: (key: string, value: string) => {
      store.set(key, String(value));
      listeners.forEach((listener) => listener(key));
    },
    getString: (key: string) => store.get(key),
    remove: (key: string) => {
      const existed = store.delete(key);
      if (existed) {
        listeners.forEach((listener) => listener(key));
      }
      return existed;
    },
    addOnValueChangedListener: (onValueChanged: Listener) => {
      listeners.add(onValueChanged);
      return { remove: () => listeners.delete(onValueChanged) };
    },
  };
}

type FakeMMKV = ReturnType<typeof createFakeMMKV>;

// Real MMKV shares one on-disk store per `id`; mirror that so repeated
// createMMKV({ id }) calls in tests see the same in-memory data.
const instancesById = new Map<string, FakeMMKV>();

export function createMMKV(configuration?: { id?: string }): FakeMMKV {
  const id = configuration?.id ?? "mmkv.default";
  let instance = instancesById.get(id);
  if (!instance) {
    instance = createFakeMMKV();
    instancesById.set(id, instance);
  }
  return instance;
}

export function useMMKVString(
  key: string,
  instance?: FakeMMKV,
): [string | undefined, (value: string) => void] {
  const mmkv = instance ?? createMMKV();
  const value = useSyncExternalStore(
    (onChange) => {
      const listener = mmkv.addOnValueChangedListener((changedKey) => {
        if (changedKey === key) {
          onChange();
        }
      });
      return () => listener.remove();
    },
    () => mmkv.getString(key),
  );
  return [value, (next: string) => mmkv.set(key, next)];
}
