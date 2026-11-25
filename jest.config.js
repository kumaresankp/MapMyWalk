module.exports = {
  preset: '@react-native/jest-preset',
  testTimeout: 15000,
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-url-polyfill)/)',
  ],
};
