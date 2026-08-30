import { forwardRef, useCallback, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  TextInput as RNTextInput,
  type TextInput as RNTextInputInstance,
} from "react-native";

import { fieldA11yProps } from "@/features/accessibility";
import { createStyles } from "@/features/responsive";

import FormField from "../form-field";
import type {
  CodeCharset,
  CodeInputTypeProps,
  CommonInputProps,
} from "../types";
import CodeCell from "./cell";

type Props = Omit<CodeInputTypeProps, "type"> & CommonInputProps;

const DEFAULT_LENGTH = 6;

/**
 * What each charset allows, what to strip, and which keyboard to ask for.
 * Kept together so a new charset is one entry rather than three scattered
 * conditionals.
 */
const CHARSET = {
  numeric: {
    strip: /[^0-9]/g,
    keyboardType: "number-pad" as const,
    autoCapitalize: "none" as const,
  },
  alphanumeric: {
    strip: /[^0-9a-zA-Z]/g,
    keyboardType: "default" as const,
    // Codes are read off a screen and typed back, and they're conventionally
    // shown in capitals — so the keyboard starts there. The value itself is
    // left as typed: whether a code is case-sensitive is the service's call,
    // not this field's.
    autoCapitalize: "characters" as const,
  },
} satisfies Record<CodeCharset, unknown>;

/**
 * Which autofill hint offers the code from a text message. The two platforms
 * spell it differently and each ignores the other's value, so this is a
 * genuine `Platform.select` rather than one string that happens to work
 * twice.
 */
const OTP_AUTOCOMPLETE = Platform.select({
  ios: "one-time-code" as const,
  android: "sms-otp" as const,
  default: "one-time-code" as const,
});

/**
 * A row of boxes for a verification code, backed by exactly one text input.
 *
 * That single input is the whole design. iOS offers a texted code into *one*
 * field — the "From Messages" strip above the keyboard fills it in one go —
 * so the usual approach of one `TextInput` per box takes the entire code
 * into the first box and quietly loses the feature. Here the real input is
 * stretched invisibly across the row and holds the whole value; the boxes
 * are plain views drawing what it holds, and a tap anywhere lands on the
 * input underneath.
 *
 * Digits only: `keyboardType` asks for the number pad, and anything else —
 * from a paste, or a keyboard that ignores the hint — is stripped, the same
 * way `numeric` does it.
 *
 * @example <Input type="code" value={code} onChange={setCode} onComplete={verify} />
 * @example <Input type="code" length={4} value={code} onChange={setCode} label="Enter the code" />
 */
const CodeInput = forwardRef<RNTextInputInstance, Props>(function CodeInput(
  {
    value,
    onChange,
    length = DEFAULT_LENGTH,
    onComplete,
    charset = "numeric",
    label,
    error,
    helperText,
    disabled,
    style,
    onFocus,
    onBlur,
  },
  ref,
) {
  const styles = useStyles();
  const [focused, setFocused] = useState(false);

  /**
   * The row needs the input for two things — to focus it on tap, and to hand
   * it to whoever passed a `ref` — so the node is captured here and passed
   * on rather than forwarded straight through.
   */
  const inputRef = useRef<RNTextInputInstance | null>(null);
  const captureInput = useCallback(
    (node: RNTextInputInstance | null) => {
      inputRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  const rules = CHARSET[charset];
  const characters = Array.from({ length }, (_, index) => value[index] ?? "");
  const complete = value.length >= length;
  // Where the next digit lands. Clamped so a full code keeps the highlight
  // on its last box rather than on a box that doesn't exist.
  const cursor = Math.min(value.length, length - 1);

  function handleChangeText(next: string) {
    const cleaned = next.replace(rules.strip, "").slice(0, length);
    if (cleaned === value) return;

    onChange(cleaned);
    if (cleaned.length === length) onComplete?.(cleaned);
  }

  return (
    <FormField
      label={label}
      error={error}
      helperText={helperText}
      style={style}
    >
      {/* Tapping anywhere on the row focuses the field. The invisible input
          below covers the row and would mostly catch the tap itself, but
          that leaves focus depending on hit-testing a zero-opacity view —
          which is exactly the sort of thing that behaves differently on
          each platform. This makes it explicit. */}
      <Pressable
        testID="code-row"
        onPress={() => inputRef.current?.focus()}
        disabled={disabled}
        // The field inside is the control; this only forwards taps to it.
        // Left accessible, a Pressable wrapping a TextInput gives a screen
        // reader two competing stops for one field.
        accessible={false}
        style={[styles.row, disabled ? styles.disabled : null]}
      >
        {characters.map((character, index) => (
          <CodeCell
            // Boxes are positions, not values — index is the identity here.
            key={index}
            index={index}
            character={character}
            active={focused && !disabled && index === cursor}
            invalid={error !== undefined}
          />
        ))}

        {/* Last so it sits above the boxes, and invisible rather than
            unmounted: it has to stay focusable and on screen for the OS to
            offer a code into it. */}
        <RNTextInput
          ref={captureInput}
          style={styles.input}
          value={value}
          onChangeText={handleChangeText}
          editable={!disabled}
          keyboardType={rules.keyboardType}
          autoCapitalize={rules.autoCapitalize}
          autoCorrect={false}
          maxLength={length}
          // A tap lands somewhere in the invisible field and moves the real
          // caret with it, which would then disagree with the box drawn as
          // active. Pinning it to the end keeps the two in step, and typing
          // always continues where the drawing says it will. Released once
          // the code is full so a selection can still be made to clear it.
          selection={
            complete ? undefined : { start: value.length, end: value.length }
          }
          autoComplete={OTP_AUTOCOMPLETE}
          // iOS reads this one rather than `autoComplete`, and it's what
          // puts the code on the QuickType bar.
          textContentType="oneTimeCode"
          // The boxes draw the value; a caret would sit in the middle of
          // the row over whichever box happened to be under it.
          caretHidden
          {...fieldA11yProps({ label, disabled, error })}
          onFocus={() => {
            setFocused(true);
            onFocus?.();
          }}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
        />
      </Pressable>
    </FormField>
  );
});

CodeInput.displayName = "CodeInput";

export default CodeInput;

const useStyles = createStyles(({ spacing }) => ({
  row: {
    // Codes read left to right in every locale — they're characters in a
    // sequence, not prose — so this row is the one that doesn't mirror,
    // which is simply `row` and never `row-reverse`. Nothing sets Yoga's own
    // direction in this app (see features/localization's useIsRtl), so
    // that's all it takes; a `direction` style here would be redundant and
    // isn't a property react-native-web accepts.
    flexDirection: "row",
    gap: spacing.x8,
  },
  disabled: {
    opacity: 0.5,
  },
  input: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    // Invisible, not hidden: `display: none` or zero size would take it out
    // of the layout and the OS would have nothing to offer the code to.
    opacity: 0,
  },
}));
