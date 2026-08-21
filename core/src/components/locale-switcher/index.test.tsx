import Text from "@/components/text";
import { useLocale } from "@/features/localization";
import { fireEvent, render, screen, waitFor } from "@/root/testing";

import Component from "./index";

function CurrentPreference() {
  const locale = useLocale();
  return <Text value={`preference: ${locale.preference}`} />;
}

describe(`${Component.name} smoke test`, () => {
  it("renders an option for every locale plus system", async () => {
    await render(<Component />);

    expect(screen.getByText("English")).toBeTruthy();
    expect(screen.getByText("Українська")).toBeTruthy();
    expect(screen.getByText("Español")).toBeTruthy();
    expect(screen.getByText("中文")).toBeTruthy();
    expect(screen.getByText("日本語")).toBeTruthy();
    expect(screen.getByText("العربية")).toBeTruthy();
    expect(screen.getByText("System")).toBeTruthy();
  });

  it("updates the locale preference on press", async () => {
    await render(
      <>
        <Component />
        <CurrentPreference />
      </>,
    );

    fireEvent.press(screen.getByText("Español"));

    await waitFor(() =>
      expect(screen.getByText("preference: es")).toBeTruthy(),
    );
  });
});
