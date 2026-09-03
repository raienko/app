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

type SwitchOptions = {
  /** The visible label that names the switch. */
  label: string;
  value: boolean;
  disabled?: boolean;
};

/** Native and web accessibility state for an app-owned switch. */
export function switchA11yProps({
  label,
  value,
  disabled = false,
}: SwitchOptions): AccessibilityProps {
  return {
    accessibilityRole: "switch",
    role: "switch",
    accessibilityLabel: label,
    accessibilityState: { checked: value, disabled },
    "aria-checked": value,
    "aria-disabled": disabled,
  };
}

type RadioOptions = {
  /** The visible label that names this option within its radio group. */
  label: string;
  checked: boolean;
  disabled?: boolean;
};

/** Native and web accessibility state for one app-owned radio option. */
export function radioA11yProps({
  label,
  checked,
  disabled = false,
}: RadioOptions): AccessibilityProps {
  return {
    accessibilityRole: "radio",
    role: "radio",
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

type SliderOptions = {
  label: string;
  value: number;
  valueText: string;
  min: number;
  max: number;
  disabled?: boolean;
  hint?: string;
};

type SliderAccessibilityProps = AccessibilityProps & {
  accessible: true;
  role: "slider";
  "aria-valuemin": number;
  "aria-valuemax": number;
  "aria-valuenow": number;
  "aria-valuetext": string;
  "aria-disabled": boolean;
};

/** Native adjustable semantics plus the equivalent ARIA range contract. */
export function sliderA11yProps({
  label,
  value,
  valueText,
  min,
  max,
  disabled = false,
  hint,
}: SliderOptions): SliderAccessibilityProps {
  return {
    accessible: true,
    accessibilityRole: "adjustable",
    role: "slider",
    accessibilityLabel: label,
    accessibilityValue: { min, max, now: value, text: valueText },
    accessibilityState: { disabled },
    accessibilityActions: [{ name: "increment" }, { name: "decrement" }],
    ...(hint === undefined ? null : { accessibilityHint: hint }),
    "aria-valuemin": min,
    "aria-valuemax": max,
    "aria-valuenow": value,
    "aria-valuetext": valueText,
    "aria-disabled": disabled,
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

type ImageOptions = {
  /**
   * What the image conveys, in words — not "photo of" or the file's name.
   * An image with nothing to convey isn't described, it's hidden: use
   * `disabledA11yProps()` below instead.
   */
  label: string;
};

/**
 * The accessibility props for an image that carries meaning. An image is
 * the one control-shaped thing with no text of its own to derive a name
 * from, so an undescribed one is announced as an anonymous element that a
 * screen-reader user can neither read nor skip past knowingly.
 *
 * `accessible: true` is deliberate rather than redundant: `expo-image`
 * defaults it to `false`, so an image left alone isn't an accessibility
 * element on iOS or Android at all. `accessibilityRole="image"` is what
 * native announces and `role="img"` is what react-native-web renders — the
 * same two-spelling split as everything else here.
 *
 * Callers should also pass the label to `expo-image`'s own `alt`, which is
 * what puts it in the DOM's `alt` attribute for web crawlers and link
 * traversal — see `Image`.
 */
export function imageA11yProps({ label }: ImageOptions): AccessibilityProps {
  return {
    accessible: true,
    accessibilityRole: "image",
    role: "img",
    accessibilityLabel: label,
  };
}

/**
 * The accessibility props for something that exists only visually and has
 * nothing to say — a `Spacer`, a decorative rule, an icon sitting beside a
 * label that already names it. Without them a purely presentational node
 * still becomes a stop a screen-reader user has to swipe past, announced as
 * an empty element.
 *
 * Four spellings, and as with the rest of this file no single one covers
 * every platform: `accessible: false` keeps it from becoming an element in
 * the first place, `accessibilityElementsHidden` hides it *and its
 * descendants* on iOS, `importantForAccessibility="no-hide-descendants"` is
 * Android's equivalent, and `aria-hidden` is what react-native-web turns
 * into the real DOM attribute. Setting only one leaves it announced on
 * whichever platforms the others cover.
 *
 * @example
 * <View {...disabledA11yProps()} style={{ height: 16 }} />
 */
export function disabledA11yProps(): AccessibilityProps {
  return {
    accessible: false,
    accessibilityElementsHidden: true,
    importantForAccessibility: "no-hide-descendants",
    "aria-hidden": true,
  };
}
