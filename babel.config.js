module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '~': './',
        },
      },
    ],
    'inline-react-svg',
    'react-native-reanimated/plugin',
    '@babel/plugin-proposal-export-namespace-from',
  ],
};
