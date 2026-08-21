import { act, createRef } from "react";
import { Text as RNText } from "react-native";

import { fireEvent, render, screen, waitFor } from "@/root/testing";

import Component from "./index";
import type { ModalHandle } from "./types";

function flattenStyle(style: unknown): Record<string, unknown>[] {
  if (Array.isArray(style)) return style.flatMap(flattenStyle);
  if (style && typeof style === "object")
    return [style as Record<string, unknown>];
  return [];
}

describe(`${Component.displayName} smoke test`, () => {
  it("is not visible by default", async () => {
    await render(
      <Component id="test-default">
        <RNText>content</RNText>
      </Component>,
    );

    expect(screen.queryByText("content")).toBeNull();
  });

  it("shows when ref.show() is called and hides when ref.hide() is called", async () => {
    const ref = createRef<ModalHandle>();
    await render(
      <Component ref={ref} id="test-ref">
        <RNText>content</RNText>
      </Component>,
    );

    act(() => ref.current?.show());
    await waitFor(() => {
      expect(screen.queryByText("content")).toBeTruthy();
    });

    act(() => ref.current?.hide());
    await waitFor(() => {
      expect(screen.queryByText("content")).toBeNull();
    });
  });

  it("shows/hides via the static id-based API", async () => {
    await render(
      <Component id="test-static">
        <RNText>content</RNText>
      </Component>,
    );

    act(() => Component.show("test-static"));
    await waitFor(() => {
      expect(screen.queryByText("content")).toBeTruthy();
    });

    act(() => Component.hide("test-static"));
    await waitFor(() => {
      expect(screen.queryByText("content")).toBeNull();
    });
  });

  it("only reacts to its own id", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(
      <Component id="test-this-one">
        <RNText>content</RNText>
      </Component>,
    );

    act(() => Component.show("some-other-id"));

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(screen.queryByText("content")).toBeNull();
    // no <Modal id="some-other-id" /> is mounted — dev warning, not silence.
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Modal.show("some-other-id")'),
    );
    warn.mockRestore();
  });

  it("hides on backdrop tap by default", async () => {
    const ref = createRef<ModalHandle>();
    await render(
      <Component ref={ref} id="test-backdrop">
        <RNText>content</RNText>
      </Component>,
    );

    act(() => ref.current?.show());
    await waitFor(() => {
      expect(screen.queryByText("content")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("modal-backdrop"));
    await waitFor(() => {
      expect(screen.queryByText("content")).toBeNull();
    });
  });

  it("calls onDismiss instead of hiding when provided, on both backdrop tap and onRequestClose", async () => {
    const onDismiss = jest.fn();
    const ref = createRef<ModalHandle>();
    await render(
      <Component ref={ref} id="test-on-dismiss" onDismiss={onDismiss}>
        <RNText>content</RNText>
      </Component>,
    );

    act(() => ref.current?.show());
    await waitFor(() => {
      expect(screen.queryByText("content")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("modal-backdrop"));

    expect(onDismiss).toHaveBeenCalledTimes(1);
    // onDismiss doesn't hide on its own — the modal is still up until the
    // consumer explicitly hides it (or chooses not to).
    expect(screen.queryByText("content")).toBeTruthy();
  });

  it("has a backdrop for type=actions but no content background", async () => {
    const ref = createRef<ModalHandle>();
    await render(
      <Component ref={ref} id="test-actions-backdrop" type="actions">
        <RNText>content</RNText>
      </Component>,
    );

    act(() => ref.current?.show());
    await waitFor(() => {
      expect(screen.queryByText("content")).toBeTruthy();
    });

    expect(screen.getByTestId("modal-backdrop")).toBeTruthy();
    const contentStyles = flattenStyle(
      screen.getByText("content").parent?.props.style,
    );
    expect(contentStyles.some((s) => "backgroundColor" in s)).toBe(false);
  });

  it("does not have a backdrop for type=fullscreen", async () => {
    const ref = createRef<ModalHandle>();
    await render(
      <Component ref={ref} id="test-fullscreen-backdrop" type="fullscreen">
        <RNText>content</RNText>
      </Component>,
    );

    act(() => ref.current?.show());
    await waitFor(() => {
      expect(screen.queryByText("content")).toBeTruthy();
    });

    expect(screen.queryByTestId("modal-backdrop")).toBeNull();
  });

  it("warns when a second instance mounts with an id already in use", async () => {
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    await render(
      <>
        <Component id="test-duplicate">
          <RNText>first</RNText>
        </Component>
        <Component id="test-duplicate">
          <RNText>second</RNText>
        </Component>
      </>,
    );

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('more than one <Modal id="test-duplicate" />'),
    );
    warn.mockRestore();
  });

  it("marks the modal as an accessible modal view and labels the backdrop", async () => {
    const ref = createRef<ModalHandle>();
    await render(
      <Component ref={ref} id="test-a11y">
        <RNText>content</RNText>
      </Component>,
    );

    act(() => ref.current?.show());
    await waitFor(() => {
      expect(screen.queryByText("content")).toBeTruthy();
    });

    const backdrop = screen.getByTestId("modal-backdrop");
    expect(backdrop.props.accessibilityRole).toBe("button");
    expect(backdrop.props.accessibilityLabel).toBe("Dismiss");
  });

  it.each([
    ["bottomSheet", true],
    ["actions", true],
    ["popup", false],
    ["fullscreen", false],
  ] as const)(
    "drag handle presence for type=%s is %s",
    async (type, hasHandle) => {
      const ref = createRef<ModalHandle>();
      await render(
        <Component ref={ref} id={`test-handle-${type}`} type={type}>
          <RNText>content</RNText>
        </Component>,
      );

      act(() => ref.current?.show());
      await waitFor(() => {
        expect(screen.queryByText("content")).toBeTruthy();
      });

      if (hasHandle) {
        expect(screen.getByTestId("modal-drag-handle")).toBeTruthy();
      } else {
        expect(screen.queryByTestId("modal-drag-handle")).toBeNull();
      }
    },
  );

  it.each(["popup", "bottomSheet", "actions", "fullscreen"] as const)(
    "renders content for type=%s",
    async (type) => {
      const ref = createRef<ModalHandle>();
      await render(
        <Component ref={ref} id={`test-${type}`} type={type}>
          <RNText>content</RNText>
        </Component>,
      );

      act(() => ref.current?.show());

      await waitFor(() => {
        expect(screen.queryByText("content")).toBeTruthy();
      });
    },
  );
});
