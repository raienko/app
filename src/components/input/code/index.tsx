import { forwardRef, useCallback, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  TextInput as RNTextInput,
  type TextInput as RNTextInputInstance,
} from "react-native";

import { fieldA11yProps } from "@/features/accessibility";
import { createStyles } from "@/features/responsive";

import FormField from "@/components/form-field";
import type {
  CodeCharset,
  CodeInputTypeProps,
  CommonInputProps,
} from "../types";
import CodeCell from "./cell";

type Props = Omit<CodeInputTypeProps, "type"> & CommonInputProps;

const DEFAULT_LENGTH = 6;

/** One entry per charset, rather than three scattered conditionals. */
const CHARSET = {
  numeric: {
    strip: /[^0-9]/g,
    keyboardType: "number-pad" as const,
    autoCapitalize: "none" as const,
  },
  alphanumeric: {
    strip: /[^0-9a-zA-Z]/g,
    keyboardType: "default" as const,
    // The keyboard starts in capitals; the value is left as typed, since
    // whether a code is case-sensitive is the service's call.
    autoCapitalize: "characters" as const,
  },
} satisfies Record<CodeCharset, unknown>;

/** The platforms spell this differently and each ignores the other's value. */
const OTP_AUTOCOMPLETE = Platform.select({
  ios: "one-time-code" as const,
  android: "sms-otp" as const,
  default: "one-time-code" as const,
});

/**
 * A row of boxes for a verification code, backed by exactly one text input.
 *
 * That single input is the whole design: iOS offers a texted code into *one*
 * field, so the usual one-`TextInput`-per-box approach takes the entire code
 * into the first box and loses the feature. Here the real input is stretched
 * invisibly across the row and the boxes only draw what it holds.
 *
 * @example <Input type="code" value={code} onChange={setCode} onComplete={verify} />
 * @example <Input type="code" charset="alphanumeric" value={code} onChange={setCode} />
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
    required,
    disabled,
    style,
    onFocus,
    onBlur,
  },
  ref,
) {
  const styles = useStyles();
  const [focused, setFocused] = useState(false);

  // Captured rather than forwarded straight through, because the row needs
  // it to focus on tap as well as handing it to whoever passed a `ref`.
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
  // Clamped, so a full code highlights its last box rather than one that
  // doesn't exist.
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
      required={required}
      style={style}
    >
      {/* The invisible input would mostly catch the tap itself, but that
          leaves focus depending on hit-testing a zero-opacity view. */}
      <Pressable
        testID="code-row"
        onPress={() => inputRef.current?.focus()}
        disabled={disabled}
        // Left accessible, a Pressable wrapping a TextInput gives a screen
        // reader two competing stops for one field.
        accessible={false}
        style={[styles.row, disabled ? styles.disabled : null]}
      >
        {characters.map((character, index) => (
          <CodeCell
            key={index}
            index={index}
            character={character}
            active={focused && !disabled && index === cursor}
            invalid={error !== undefined}
          />
        ))}

        {/* Invisible rather than unmounted: it has to stay focusable and on
            screen for the OS to offer a code into it. */}
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
          // A tap moves the real caret, which would then disagree with the
          // box drawn as active. Released once full so the code can still be
          // selected and cleared.
          selection={
            complete ? undefined : { start: value.length, end: value.length }
          }
          autoComplete={OTP_AUTOCOMPLETE}
          // iOS reads this rather than `autoComplete`; it's what puts the
          // code on the QuickType bar.
          textContentType="oneTimeCode"
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
    // Codes read left to right in every locale, so this row never mirrors.
    // Nothing sets Yoga's own direction here (see useIsRtl), so plain `row`
    // is all it takes.
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
    // Invisible, not hidden: zero size or `display: none` would take it out
    // of the layout and the OS would have nothing to offer the code to.
    opacity: 0,
  },
}));
