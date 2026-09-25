export interface StorageAdapter {
  getItem(key: string): string | undefined;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  useValue(key: string): string | undefined;
}
