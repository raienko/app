import { Observe, ObserveRoot } from "expo-observe";

import withObserve from "./index";

jest.mock("@/constants/env", () => ({
  __esModule: true,
  default: { projectId: "configured-project-id" },
}));

jest.mock("expo-observe", () => ({
  Observe: { configure: jest.fn() },
  ObserveRoot: { wrap: jest.fn((Component) => Component) },
}));

describe("withObserve with a configured project", () => {
  it("configures Observe and wraps the component", () => {
    function Component() {
      return null;
    }

    const Wrapped = withObserve(Component);

    expect(Observe.configure).toHaveBeenCalledWith({
      integrations: { "expo-router": true },
      dispatchInDebug: false,
    });
    expect(ObserveRoot.wrap).toHaveBeenCalledWith(Component);
    expect(Wrapped).toBe(Component);
  });
});
