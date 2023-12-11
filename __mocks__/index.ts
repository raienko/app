import '@testing-library/jest-native/extend-expect';

export * from './utils.tsx';

// React Navigation mock
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};

  return Reanimated;
});

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({}),
}));

jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({
    params: {},
  }),
  useIsFocused: () => false,
  createNavigationContainerRef: () => {},
  NavigationContainer: () => null,
}));

jest.mock('@react-navigation/core', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('@react-navigation/stack', () => ({
  createStackNavigator: () => jest.fn(),
  TransitionPresets: {
    SlideFromRightIOS: {},
  },
}));

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
jest.mock('react-native/Libraries/Utilities/Appearance', () => ({
  getColorScheme: () => jest.fn(),
  addChangeListener: () => jest.fn(),
}));
