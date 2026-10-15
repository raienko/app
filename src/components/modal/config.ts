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
  /**
   * Whether children sit in Modal's ScrollView. Off for `immersive`, whose
   * content runs its own gestures (pinch, pan, swipe-to-dismiss) that a
   * surrounding ScrollView would steal.
   */
  scroll: boolean;
  /** Content runs to every edge: no padding and no top inset of Modal's own. */
  edgeToEdge: boolean;
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
    scroll: true,
    edgeToEdge: false,
  },
  bottomSheet: {
    position: "bottom",
    animation: "slideUp",
    backdrop: true,
    contentBackground: true,
    scroll: true,
    edgeToEdge: false,
  },
  actions: {
    position: "bottom",
    animation: "slideUp",
    backdrop: true,
    contentBackground: false,
    scroll: true,
    edgeToEdge: false,
  },
  fullscreen: {
    position: "fullscreen",
    animation: "fade",
    backdrop: false,
    contentBackground: true,
    scroll: true,
    edgeToEdge: false,
  },
  immersive: {
    position: "fullscreen",
    animation: "fade",
    backdrop: false,
    contentBackground: false,
    scroll: false,
    edgeToEdge: true,
  },
};
