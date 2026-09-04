import { render, screen } from "@testing-library/react-native";
import { Text as RNText } from "react-native";

import { useTheme } from "@/features/theme";

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

  it("passes provider configuration to the shared theme", async () => {
    function ThemeProbe() {
      const theme = useTheme();
      return <RNText>{theme.colors.primary}</RNText>;
    }

    await render(
      <Component
        config={{ theme: { overrides: { light: { primary: "#123456" } } } }}
      >
        <ThemeProbe />
      </Component>,
    );

    expect(screen.getByText("#123456")).toBeTruthy();
  });
});
