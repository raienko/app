require("@expo/env").load(__dirname, { silent: true });

jest.mock(
  "react-native-safe-area-context",
  () => require("react-native-safe-area-context/jest/mock").default,
);

require("react-native-gesture-handler/jestSetup");

jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock"),
);
