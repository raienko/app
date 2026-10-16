export interface StorageAdapter<RemoveResult = void> {
  getItem(key: string): string | undefined;
  setItem(key: string, value: string): void;
  removeItem(key: string): RemoveResult;
  useValue(key: string): string | undefined;
}
