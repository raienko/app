import { AccessibilityInfo, View } from "react-native";

import Text from "@/components/text";
import { act, render, waitFor } from "@/root/testing";

import Component from "./index";

const ARTWORK = 1 as never;
const hidden = { includeHiddenElements: true } as const;

type View_ = Awaited<ReturnType<typeof render>>;

/**
 * The shimmer only mounts once the box has measured itself. Driven through
 * `onLayout` directly rather than `fireEvent`, which declines to dispatch
 * into a subtree this component deliberately hides from accessibility.
 */
async function measure(view: View_, width = 300, height = 100) {
  const { onLayout } = view.getByTestId("skeleton", hidden).props;
  await act(async () => {
    onLayout({ nativeEvent: { layout: { width, height, x: 0, y: 0 } } });
  });
}

describe(`${Component.name} smoke test`, () => {
  it("draws the artwork it was given", async () => {
    const view = await render(<Component testID="skeleton" source={ARTWORK} />);

    expect(view.getByTestId("image", hidden)).toBeTruthy();
  });

  // Only the alpha survives: the export's own greys never reach the screen.
  it("recolours the artwork to the app's own surface", async () => {
    const view = await render(<Component testID="skeleton" source={ARTWORK} />);

    expect(view.getByTestId("image", hidden).props.tintColor).toBeTruthy();
  });

  it("draws children instead, exactly as given", async () => {
    const view = await render(
      <Component testID="skeleton">
        <Text value="Placeholder" />
      </Component>,
    );

    expect(view.getByText("Placeholder", hidden)).toBeTruthy();
    expect(view.queryByTestId("image", hidden)).toBeNull();
  });

  describe("the shimmer", () => {
    it("waits for the box to measure itself", async () => {
      const view = await render(
        <Component testID="skeleton" source={ARTWORK} />,
      );

      expect(view.queryByTestId("skeleton-shimmer", hidden)).toBeNull();

      await measure(view);

      expect(view.getByTestId("skeleton-shimmer", hidden)).toBeTruthy();
    });

    it("is absent entirely when the caller turns it off", async () => {
      const view = await render(
        <Component testID="skeleton" source={ARTWORK} animated={false} />,
      );
      await measure(view);

      expect(view.queryByTestId("skeleton-shimmer", hidden)).toBeNull();
      expect(view.getByTestId("image", hidden)).toBeTruthy();
    });

    it("sweeps over children too", async () => {
      const view = await render(
        <Component testID="skeleton">
          <View />
        </Component>,
      );
      await measure(view);

      expect(view.getByTestId("skeleton-shimmer", hidden)).toBeTruthy();
    });
  });

  /**
   * Unlike `ProgressBar`, nothing is substituted. Its movement carries
   * information — "this is still going" — and something has to take that
   * over; a skeleton's does not, because the shapes already say the content
   * hasn't arrived.
   */
  describe("with Reduce Motion on", () => {
    beforeEach(() => {
      jest
        .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
        .mockResolvedValue(true);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("draws no highlight at all, and does not substitute one", async () => {
      const view = await render(
        <Component testID="skeleton" source={ARTWORK} />,
      );
      await measure(view);

      await waitFor(() => {
        expect(view.queryByTestId("skeleton-shimmer", hidden)).toBeNull();
      });
    });

    it("still shows the placeholder itself", async () => {
      const view = await render(
        <Component testID="skeleton" source={ARTWORK} />,
      );
      await measure(view);

      expect(view.getByTestId("image", hidden)).toBeTruthy();
    });
  });

  describe("accessibility", () => {
    // A skeleton is a picture of content that hasn't arrived: nothing to
    // read, nothing to act on, and usually the screen already says so.
    it("is hidden on every platform when it isn't named", async () => {
      const view = await render(
        <Component testID="skeleton" source={ARTWORK} />,
      );
      const { props } = view.getByTestId("skeleton", hidden);

      expect(props.accessible).toBe(false);
      expect(props.accessibilityElementsHidden).toBe(true);
      expect(props.importantForAccessibility).toBe("no-hide-descendants");
      expect(props["aria-hidden"]).toBe(true);
    });

    it("is not reachable as an accessibility element", async () => {
      const view = await render(
        <Component testID="skeleton" source={ARTWORK} />,
      );

      expect(view.queryByTestId("skeleton")).toBeNull();
    });

    // Named, it becomes the announcement rather than a second one.
    it("becomes a polite live region once it is named", async () => {
      const view = await render(
        <Component
          testID="skeleton"
          source={ARTWORK}
          label="Loading messages"
        />,
      );
      const { props } = view.getByTestId("skeleton");

      expect(props.accessibilityLabel).toBe("Loading messages");
      expect(props.accessibilityLiveRegion).toBe("polite");
      expect(props["aria-live"]).toBe("polite");
      expect(props.role).toBe("status");
    });

    it("keeps the artwork itself out of the tree", async () => {
      const view = await render(
        <Component testID="skeleton" source={ARTWORK} label="Loading" />,
      );

      expect(view.getByTestId("image", hidden).props.accessible).toBe(false);
    });
  });

  it("keeps the highlight inside its own box", async () => {
    const view = await render(<Component testID="skeleton" source={ARTWORK} />);
    const style = Object.assign(
      {},
      ...[view.getByTestId("skeleton", hidden).props.style]
        .flat(3)
        .filter(Boolean),
    );

    expect(style.overflow).toBe("hidden");
  });

  it("merges a caller's style over its own", async () => {
    const view = await render(
      <Component testID="skeleton" source={ARTWORK} style={{ width: 120 }} />,
    );
    const style = Object.assign(
      {},
      ...[view.getByTestId("skeleton", hidden).props.style]
        .flat(3)
        .filter(Boolean),
    );

    expect(style.width).toBe(120);
  });
});
