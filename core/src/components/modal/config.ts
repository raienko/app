import type { ModalType } from "./types";

export type ModalPosition = "center" | "bottom" | "fullscreen";
export type ModalAnimation = "fade" | "slideUp";

export type ModalTypeConfig = {
  position: ModalPosition;
  animation: ModalAnimation;
  /** Whether a dimmed, tap-to-dismiss layer renders behind the content. */
  backdrop: boolean;
  /**
   * Whether the content wrapper itself gets theme.colors.background. Off
   * for "actions" — it behaves like a native action sheet, a stack of
   * independently-styled action items (e.g. Buttons, which already supply
   * their own background) with no unifying card behind them.
   */
  contentBackground: boolean;
};

/**
 * What visually differs between Modal's `type`s. Add a new type by adding
 * one entry here (+ the literal to ModalType in ./types.ts) — index.tsx
 * reads these generically and doesn't need to change.
 */
export const MODAL_TYPE_CONFIG: Record<ModalType, ModalTypeConfig> = {
  popup: {
    position: "center",
    animation: "fade",
    backdrop: true,
    contentBackground: true,
  },
  bottomSheet: {
    position: "bottom",
    animation: "slideUp",
    backdrop: true,
    contentBackground: true,
  },
  actions: {
    position: "bottom",
    animation: "slideUp",
    backdrop: true,
    contentBackground: false,
  },
  fullscreen: {
    position: "fullscreen",
    animation: "fade",
    backdrop: false,
    contentBackground: true,
  },
};
