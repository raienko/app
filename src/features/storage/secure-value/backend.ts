import * as SecureStore from "expo-secure-store";

/**
 * Native: the iOS Keychain and the Android Keystore, through
 * expo-secure-store. Reads and writes are synchronous; deletion is async.
 */
const secureBackend = {
  get: (key: string): string | undefined =>
    SecureStore.getItem(key) ?? undefined,
  set: (key: string, value: string): void => SecureStore.setItem(key, value),
  remove: (key: string): Promise<void> => SecureStore.deleteItemAsync(key),
};

export default secureBackend;
