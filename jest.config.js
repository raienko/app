module.exports = {
  preset: 'react-native',
  moduleDirectories: ['node_modules', '~/src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|react-native-vector-icons|@react-navigation|i18n-js|react-native-reanimated|react-redux|react-native-calendars|react-native-vector-icons)/)',
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/file.tsx',
  },
};
