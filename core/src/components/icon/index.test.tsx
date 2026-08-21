import { useTheme } from "@/features/theme";
import { render } from "@/root/testing";

import Component from "./index";

describe(`${Component.name} smoke test`, () => {
  it("renders a vector icon", async () => {
    const { toJSON } = await render(<Component type="Feather" name="home" />);

    expect(toJSON()).toBeTruthy();
  });

  it("defaults to the default icon type when type is omitted", async () => {
    const withDefault = await render(<Component name="home" />);
    const withExplicitDefault = await render(
      <Component type="Feather" name="home" />,
    );

    expect(JSON.stringify(withDefault.toJSON())).toBe(
      JSON.stringify(withExplicitDefault.toJSON()),
    );
  });

  it("renders a custom icon", async () => {
    const { toJSON } = await render(<Component type="custom" name="logo" />);

    expect(toJSON()).toBeTruthy();
  });

  it("passes size and color through to a vector icon", async () => {
    const { toJSON } = await render(
      <Component type="Feather" name="home" size={32} color="red" />,
    );

    expect(JSON.stringify(toJSON())).toContain("red");
  });

  it("defaults color to theme.colors.text when color is omitted", async () => {
    let themeColor: string | undefined;
    function ThemeColorReader() {
      themeColor = useTheme().colors.text;
      return null;
    }

    const withDefault = await render(
      <>
        <Component type="Feather" name="home" />
        <ThemeColorReader />
      </>,
    );

    expect(themeColor).toBeTruthy();
    expect(JSON.stringify(withDefault.toJSON())).toContain(
      themeColor as string,
    );
  });

  it("lets an explicit color override the theme default", async () => {
    let themeColor: string | undefined;
    function ThemeColorReader() {
      themeColor = useTheme().colors.text;
      return null;
    }

    const withOverride = await render(
      <>
        <Component type="Feather" name="home" color="blue" />
        <ThemeColorReader />
      </>,
    );

    expect(themeColor).toBeTruthy();
    expect(JSON.stringify(withOverride.toJSON())).not.toContain(
      themeColor as string,
    );
    expect(JSON.stringify(withOverride.toJSON())).toContain("blue");
  });
});
