import { render, screen } from "@testing-library/react-native";
import { Text as RNText } from "react-native";

import Component from "./index";

describe(`${Component.name} smoke test`, () => {
  it("renders its children", async () => {
    await render(
      <Component>
        <RNText>hello</RNText>
      </Component>,
    );

    expect(screen.getByText("hello")).toBeTruthy();
  });
});
