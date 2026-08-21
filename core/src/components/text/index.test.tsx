import { render, screen } from "@/root/testing";

import Component from "./index";

describe(`${Component.name} smoke test`, () => {
  it("renders the given value", async () => {
    await render(<Component value="hello" />);

    expect(screen.getByText("hello")).toBeTruthy();
  });
});
