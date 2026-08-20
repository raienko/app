export interface StorageAdapter {
  getItem(key: string): string | undefined;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  /** Reactive read of the raw stored string — called from StorageValue.use(). */
  useValue(key: string): string | undefined;
}
