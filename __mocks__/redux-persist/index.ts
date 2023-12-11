const persistStore = jest.fn();
const persistReducer = jest
  .fn()
  .mockImplementation((config, reducers) => reducers);

export {persistStore, persistReducer};
