import { render, screen } from "@testing-library/react-native";

import Component from "./index";

describe(`${Component.name} smoke test`, () => {
  it("renders the given value", async () => {
    await render(<Component value="hello" />);

    expect(screen.getByText("hello")).toBeTruthy();
  });
});
