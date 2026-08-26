import type { AccessibilityProps, AccessibilityState } from "react-native";

/** `<h1>`–`<h6>`, in document-outline terms. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type HeadingProps = AccessibilityProps & { "aria-level"?: HeadingLevel };

/**
 * Marks text as a heading at a given level, so screen-reader users can
 * navigate the screen by structure (VoiceOver's rotor, TalkBack's heading
 * navigation) instead of reading it top to bottom. Without this a visually
 * obvious title is, to a screen reader, indistinguishable from body text.
 *
 * Three spellings, because no single one covers both platforms:
 * `accessibilityRole="header"` is what native reads; `role="heading"` is
 * what react-native-web turns into a real `<h1>`–`<h6>` element; and
 * `aria-level` is how it picks *which* one. That last prop isn't in RN's
 * `TextProps`/`ViewProps` typings at all — hence the wider return type —
 * but omitting it doesn't degrade gracefully: react-native-web falls back
 * to `<h1>` for every heading, flattening the outline it exists to convey.
 * Native ignores it and takes the level from context.
 */
export function headingA11yProps(level: HeadingLevel): HeadingProps {
  return {
    accessibilityRole: "header",
    role: "heading",
    "aria-level": level,
  };
}

type ControlOptions = {
  /**
   * What a screen reader announces. Omit when the control's own text
   * children already say it — RN derives the label from them, and a
   * duplicate explicit label just makes the announcement noisier.
   */
  label?: string;
  disabled?: boolean;
  /** For a control that's one of several choices (a segmented option). */
  selected?: boolean;
  /** For a control that shows/hides content (an accordion header). */
  expanded?: boolean;
  busy?: boolean;
};

/**
 * The accessibility props for anything a user can press. Centralized here
 * so a new pressable component gets the whole set right by construction,
 * rather than each one separately remembering `accessibilityRole` (easy to
 * forget — `Button` shipped without it, which left every button in the app
 * announcing as a plain group) and which state keys to expose.
 *
 * Only the state keys actually passed are emitted: a plain button reports
 * no `selected`/`expanded` at all, instead of reporting them as `false` and
 * making a screen reader announce a selection state that doesn't exist.
 *
 * @example
 * <Pressable {...controlA11yProps({ disabled, selected })}>...</Pressable>
 */
export function controlA11yProps({
  label,
  disabled,
  selected,
  expanded,
  busy,
}: ControlOptions = {}): AccessibilityProps {
  const state: AccessibilityState = {};
  if (disabled !== undefined) state.disabled = disabled;
  if (selected !== undefined) state.selected = selected;
  if (expanded !== undefined) state.expanded = expanded;
  if (busy !== undefined) state.busy = busy;

  return {
    accessibilityRole: "button",
    ...(label === undefined ? null : { accessibilityLabel: label }),
    ...(Object.keys(state).length === 0 ? null : { accessibilityState: state }),
    // Both spellings on purpose. `accessibilityState` is what native reads
    // and what testing-library asserts against; react-native-web 0.21 only
    // renders the `aria-*` form, so state set solely through
    // `accessibilityState` reaches native correctly and silently produces
    // *nothing* in the DOM — verified by inspecting a rendered button.
    ...(disabled === undefined ? null : { "aria-disabled": disabled }),
    ...(selected === undefined ? null : { "aria-selected": selected }),
    ...(expanded === undefined ? null : { "aria-expanded": expanded }),
    ...(busy === undefined ? null : { "aria-busy": busy }),
  };
}

type FieldOptions = {
  /** A field's visible label, or its placeholder when it has no label. */
  label?: string;
  disabled?: boolean;
  /** The validation message, when the field is invalid. */
  error?: string;
};

/**
 * The accessibility props for a text field. A sibling `<Text>` label isn't
 * automatically associated with an input the way HTML's `<label for>` is,
 * so the label has to be passed explicitly.
 *
 * An `error` becomes the field's `accessibilityHint`, which VoiceOver and
 * TalkBack read out after its label. RN has no "invalid" accessibility
 * state to set — that's an ARIA concept with no React Native equivalent —
 * so a hint is the portable way to make a screen reader announce *why* a
 * field is wrong rather than leaving the red border as the only signal.
 */
export function fieldA11yProps({
  label,
  disabled,
  error,
}: FieldOptions = {}): AccessibilityProps {
  return {
    ...(label === undefined ? null : { accessibilityLabel: label }),
    accessibilityState: { disabled: disabled ?? false },
    // See the note in controlA11yProps on why both spellings are emitted.
    "aria-disabled": disabled ?? false,
    ...(error === undefined ? null : { accessibilityHint: error }),
  };
}
