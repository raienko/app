import withObserve from "./index";

jest.mock("@/constants/env", () => ({
  __esModule: true,
  default: { projectId: "configured-project-id" },
}));

jest.mock("expo-observe", () => {
  throw new Error(
    "Project ID is required to send observability metrics. Make sure you have configured it correctly in app.json.",
  );
});

describe("withObserve with mismatched native configuration", () => {
  it("keeps the component unchanged when the native module cannot initialize", () => {
    function Component() {
      return null;
    }

    expect(withObserve(Component)).toBe(Component);
  });
});
