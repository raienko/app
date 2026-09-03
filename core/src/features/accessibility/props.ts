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
  /**
   * The control's *current* setting, announced after its label — for a
   * control that carries one (a select's chosen option). Separate from
   * `label` on purpose: "Country, United Kingdom" is what a screen reader
   * should say, and folding both into `label` would instead re-announce the
   * whole string every time the value changes.
   */
  value?: string;
  /**
   * Extra context read after the label — a select's validation message, say.
   * Mirrors how `fieldA11yProps` surfaces an `error`, which RN has no
   * "invalid" state for.
   */
  hint?: string;
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
  value,
  hint,
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
    ...(value === undefined
      ? null
      : { accessibilityValue: { text: value }, "aria-valuetext": value }),
    ...(hint === undefined ? null : { accessibilityHint: hint }),
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

type CheckboxOptions = {
  /** The visible label that names the checkbox. */
  label: string;
  checked: boolean;
  disabled?: boolean;
};

/**
 * The native and web accessibility contract for a custom checkbox.
 *
 * A checkbox is not a button with a selected state: assistive technology
 * has a dedicated checkbox role and checked state, and both need to be
 * exposed. As with the other helpers in this file, both React Native and
 * ARIA spellings are emitted because each platform consumes a different
 * half of the pair.
 */
export function checkboxA11yProps({
  label,
  checked,
  disabled = false,
}: CheckboxOptions): AccessibilityProps {
  return {
    accessibilityRole: "checkbox",
    role: "checkbox",
    accessibilityLabel: label,
    accessibilityState: { checked, disabled },
    "aria-checked": checked,
    "aria-disabled": disabled,
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

type StatusOptions = {
  /**
   * How urgently the message should reach a screen reader. `"polite"` waits
   * for a pause in whatever is being read; `"assertive"` interrupts it.
   * Reserve assertive for something the user has to act on now — an error —
   * since interrupting is exactly as rude as it sounds.
   */
  urgency?: "polite" | "assertive";
  /**
   * What a screen reader announces instead of the region's own text. Useful
   * when the visible copy isn't the whole message — a `Toast` prefixes its
   * type ("Error, ...") because the colour and icon that convey it visually
   * say nothing out loud.
   */
  label?: string;
};

/**
 * The accessibility props for a region that appears (or changes) on its own
 * and should be announced without the user having to go find it — a toast,
 * an inline validation summary, a "saved" confirmation.
 *
 * Three spellings again, and again none of them covers everything:
 * `accessibilityLiveRegion` is Android's, `aria-live` is what
 * react-native-web turns into a real live region, and `role`
 * (`"status"`/`"alert"`) is what iOS VoiceOver and the DOM both understand.
 * iOS has no live-region concept at all, so a caller that must be heard
 * there announces explicitly on top of this — see `Toast`.
 */
export function statusA11yProps({
  urgency = "polite",
  label,
}: StatusOptions = {}): AccessibilityProps {
  return {
    accessibilityLiveRegion: urgency,
    "aria-live": urgency,
    role: urgency === "assertive" ? "alert" : "status",
    ...(label === undefined ? null : { accessibilityLabel: label }),
  };
}
