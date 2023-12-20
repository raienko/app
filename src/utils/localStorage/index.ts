import AsyncStorage from '@react-native-async-storage/async-storage';

class LocalStorage {
  _storage;

  constructor(storage: any) {
    this._storage = storage;
  }

  async setItem(key: string, value: any) {
    return this._storage.setItem(key, JSON.stringify(value));
  }

  async getItem(key: string) {
    const value = await this._storage.getItem(key);
    return value ? JSON.parse(value) : value;
  }

  async removeItem(key: string) {
    return this._storage.removeItem(key);
  }
}

export const localStorage = new LocalStorage(AsyncStorage);
