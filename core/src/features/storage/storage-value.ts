import type { StorageAdapter } from "./types";

/**
 * Shared get/set/reset/use implementation for a single stored value, backed
 * by a swappable StorageAdapter. LocalValue (MMKV), and future SessionValue /
 * SecureValue, all extend this with their own adapter.
 */
export default class StorageValue<T> {
  private cachedRaw: string | undefined;
  private cachedValue: T | undefined;
  private hasCached = false;

  constructor(
    private readonly adapter: StorageAdapter,
    private readonly key: string,
  ) {}

  private parse(raw: string | undefined): T | undefined {
    if (!this.hasCached || raw !== this.cachedRaw) {
      this.cachedRaw = raw;
      this.cachedValue = raw === undefined ? undefined : (JSON.parse(raw) as T);
      this.hasCached = true;
    }
    return this.cachedValue;
  }

  getValue(): T | undefined {
    return this.parse(this.adapter.getItem(this.key));
  }

  setValue(value: T): void {
    this.adapter.setItem(this.key, JSON.stringify(value));
  }

  reset(): void {
    this.adapter.removeItem(this.key);
  }

  /**
   * Reactive read — re-renders the calling component when the value changes.
   *
   * `value.use()` is a *method* call, not a `useXxx()` identifier, so React
   * Compiler's static analysis doesn't recognize it as a hook and will
   * memoize the caller as if this were a plain value read, silently
   * breaking reactivity. Any component that calls `.use()` needs a
   * `"use no memo";` directive as the first line of its body to opt out of
   * compiler memoization.
   */
  use(): T | undefined {
    return this.parse(this.adapter.useValue(this.key));
  }
}
