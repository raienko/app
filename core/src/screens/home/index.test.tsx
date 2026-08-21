import env from "@/constants/env";
import { render, screen } from "@/root/testing";

import Component from "./index";

describe(`${Component.name} smoke test`, () => {
  it("renders the app name", async () => {
    await render(<Component />);

    expect(screen.getByText(env.appName)).toBeTruthy();
  });
});
