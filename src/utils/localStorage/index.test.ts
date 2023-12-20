import '__mocks__';
import { localStorage } from './index';

const testData = {
  key: 'test_local_storage',
  value: 'tes_value',
};

describe('Testing local storage:', () => {
  it('smoke test', async () => {
    await localStorage.setItem(testData.key, testData.value);
    const restoredValue = await localStorage.getItem(testData.key);
    expect(restoredValue).toEqual(testData.value);
    await localStorage.removeItem(testData.key);
    const removedValue = await localStorage.getItem(testData.key);
    expect(removedValue).toBe(null);
  });
});
