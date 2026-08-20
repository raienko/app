import { Text as RNText } from "react-native";

import Component from "./index";

const meta = {
  title: "components/Screen",
  component: Component,
};

export default meta;

export const Default = {
  args: {
    children: <RNText>Screen content</RNText>,
  },
};
