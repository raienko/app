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

  it("is a plain view by default", async () => {
    await render(
      <Component>
        <RNText>hello</RNText>
      </Component>,
    );

    expect(screen.queryByTestId("screen-scroll")).toBeNull();
  });

  it("scrolls when asked, and still renders its children", async () => {
    await render(
      <Component scrollable>
        <RNText>hello</RNText>
      </Component>,
    );

    expect(screen.getByTestId("screen-scroll")).toBeTruthy();
    expect(screen.getByText("hello")).toBeTruthy();
  });
});
