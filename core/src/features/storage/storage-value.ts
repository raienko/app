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

  useValue(): T | undefined {
    return this.parse(this.adapter.useValue(this.key));
  }
}
