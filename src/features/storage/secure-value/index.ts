import StorageValue from "../storage-value";
import secureStorageAdapter from "./adapter";

/**
 * A value for secrets: the iOS Keychain and the Android Keystore, through
 * expo-secure-store. Reads and writes are synchronous; reset is asynchronous
 * and must be awaited before a sign-out is considered complete.
 *
 * Keep values small — native secure storage can reject large payloads, so
 * store tokens and keys here, not documents. On the web there is
 * nowhere a page's own scripts can't read, so values live in memory only
 * and are gone on reload.
 *
 * @example
 * const token = new SecureValue<string>("access-token");
 * token.setValue(jwt);
 * token.getValue(); // jwt
 * await token.reset(); // deleted before auth accepts a new sign-in
 */
export default class SecureValue<T> extends StorageValue<T, Promise<void>> {
  constructor(key: string) {
    // SecureStore only accepts these characters. Reject invalid keys rather
    // than mapping distinct caller keys onto the same secret.
    if (!/^[A-Za-z0-9._-]+$/.test(key)) {
      throw new Error(`Invalid SecureValue key "${key}"`);
    }
    super(secureStorageAdapter, key);
  }
}
