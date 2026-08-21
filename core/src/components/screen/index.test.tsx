import { Text as RNText } from "react-native";

import { render, screen } from "@/root/testing";

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
