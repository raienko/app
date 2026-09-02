import { Text as RNText } from "react-native";

import { render, screen } from "@/root/testing";

import withObserve from "./index";

jest.mock("@/constants/env", () => ({
  __esModule: true,
  default: { projectId: undefined },
}));

describe("withObserve", () => {
  it("keeps the component unchanged when projectId is not configured", async () => {
    function Component() {
      return <RNText>content</RNText>;
    }

    const Wrapped = withObserve(Component);

    expect(Wrapped).toBe(Component);
    await render(<Wrapped />);
    expect(screen.getByText("content")).toBeTruthy();
  });
});
