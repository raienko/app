import { SafeAreaInsetsContext } from "react-native-safe-area-context";

import { render, screen } from "@/root/testing";

import { TabBarSpace, useTabBarSpace } from "./index";

const NOTCH = { top: 47, bottom: 34, left: 0, right: 0 };

function heightOf(node: { props: Record<string, unknown> }): number {
  return (node.props.style as { height: number }).height;
}

describe("TabBarSpace", () => {
  it("reserves the bar but not the chin, which Screen already clears", async () => {
    let withChin = 0;
    function Probe() {
      withChin = useTabBarSpace();
      return <TabBarSpace />;
    }

    await render(
      <SafeAreaInsetsContext.Provider value={NOTCH}>
        <Probe />
      </SafeAreaInsetsContext.Provider>,
    );

    const space = screen.getByTestId("tab-bar-space", {
      includeHiddenElements: true,
    });
    expect(heightOf(space)).toBe(withChin - NOTCH.bottom);
  });

  it("leaves room for a floating bar's gap too", async () => {
    await render(<TabBarSpace variant="floating" />);
    const floating = heightOf(
      screen.getByTestId("tab-bar-space", { includeHiddenElements: true }),
    );

    await render(<TabBarSpace />);
    const sticky = heightOf(
      screen.getByTestId("tab-bar-space", { includeHiddenElements: true }),
    );

    expect(floating).toBeGreaterThan(sticky);
  });

  it("reserves the chin as well when asked to", async () => {
    let withChin = 0;
    function Probe() {
      withChin = useTabBarSpace({ variant: "floating" });
      return <TabBarSpace variant="floating" avoidChin />;
    }

    await render(
      <SafeAreaInsetsContext.Provider value={NOTCH}>
        <Probe />
      </SafeAreaInsetsContext.Provider>,
    );

    expect(
      heightOf(
        screen.getByTestId("tab-bar-space", { includeHiddenElements: true }),
      ),
    ).toBe(withChin);
  });
});
