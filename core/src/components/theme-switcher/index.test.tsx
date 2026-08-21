import Text from "@/components/text";
import { useTheme } from "@/features/theme";
import { fireEvent, render, screen, waitFor } from "@/root/testing";

import Component from "./index";

function CurrentPreference() {
  const theme = useTheme();
  return <Text value={`preference: ${theme.preference}`} />;
}

describe(`${Component.name} smoke test`, () => {
  it("renders an option for each preference", async () => {
    await render(<Component />);

    expect(screen.getByText("light")).toBeTruthy();
    expect(screen.getByText("dark")).toBeTruthy();
    expect(screen.getByText("system")).toBeTruthy();
  });

  it("updates the theme preference on press", async () => {
    await render(
      <>
        <Component />
        <CurrentPreference />
      </>,
    );

    fireEvent.press(screen.getByText("dark"));

    await waitFor(() =>
      expect(screen.getByText("preference: dark")).toBeTruthy(),
    );
  });
});
