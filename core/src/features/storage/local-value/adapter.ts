import { createMMKV, useMMKVString } from "react-native-mmkv";

import type { StorageAdapter } from "../types";

const mmkv = createMMKV({ id: "local-storage" });

const localStorageAdapter: StorageAdapter = {
  getItem: (key) => mmkv.getString(key),
  setItem: (key, value) => mmkv.set(key, value),
  removeItem: (key) => {
    mmkv.remove(key);
  },
  // useMMKVString subscribes to just this key on the native side, instead of
  // a generic "any key changed" listener re-checked in JS on every change.
  useValue: (key) => useMMKVString(key, mmkv)[0],
};

export default localStorageAdapter;
