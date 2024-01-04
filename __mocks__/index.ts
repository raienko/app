import '@testing-library/jest-native/extend-expect';

export * from './utils.tsx';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};

  return Reanimated;
});

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
jest.mock('react-native/Libraries/Utilities/Appearance', () => ({
  getColorScheme: () => jest.fn(),
  addChangeListener: () => jest.fn(),
}));
