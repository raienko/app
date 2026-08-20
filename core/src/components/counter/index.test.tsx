import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import Component from "./index";

describe(`${Component.name} smoke test`, () => {
  it("renders a starting count of 0", async () => {
    await render(<Component storageKey="counter-test-initial" />);

    expect(screen.getByText("count: 0")).toBeTruthy();
  });

  it("increments the count on press", async () => {
    await render(<Component storageKey="counter-test-increment" />);

    fireEvent.press(screen.getByText("increment"));

    await waitFor(() => expect(screen.getByText("count: 1")).toBeTruthy());
  });

  it("clears the count on reset", async () => {
    await render(<Component storageKey="counter-test-reset" />);

    fireEvent.press(screen.getByText("increment"));
    await waitFor(() => expect(screen.getByText("count: 1")).toBeTruthy());

    fireEvent.press(screen.getByText("reset"));
    await waitFor(() => expect(screen.getByText("count: 0")).toBeTruthy());
  });
});
