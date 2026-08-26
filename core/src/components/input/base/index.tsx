import { forwardRef, useState, type ReactNode } from "react";
import {
  Pressable,
  TextInput as RNTextInput,
  View,
  type TextInput as RNTextInputInstance,
  type TextInputProps as RNTextInputProps,
} from "react-native";

import Text from "@/components/text";
import { controlA11yProps, fieldA11yProps } from "@/features/accessibility";
import { createStyles } from "@/features/responsive";
import { useTheme } from "@/features/theme";

import type { CommonInputProps } from "../types";

export type BaseInputProps = CommonInputProps & {
  value: string;
  /**
   * Omitted only by a press-mode field (see `onPress`), which is never
   * editable and so can never fire it.
   */
  onChangeText?: (value: string) => void;
  keyboardType?: RNTextInputProps["keyboardType"];
  secureTextEntry?: boolean;
  /**
   * Turns the field into a button: it stops being typed into and instead
   * displays `value` (or `placeholder`, when empty) as read-only text,
   * calling this on tap. For a variation whose value is picked from
   * somewhere else — `select` picks it in a Modal — rather than typed.
   */
  onPress?: () => void;
  /** Only meaningful alongside `onPress`: whether what it opens is showing. */
  expanded?: boolean;
};

/**
 * The shared shell every input variation (Text, Numeric, Select, ...)
 * renders through — label, left/right slots, the actual value host,
 * focus/disabled styling, and error/helper text. A variation only needs to
 * resolve its own value/onChangeText (and whatever type-specific extras) and
 * hand the rest straight through here; none of that shared UI is duplicated
 * per variation.
 *
 * autoCapitalize/autoCorrect default off *here*, so every current and future
 * variation gets that default for free without having to remember it.
 *
 * Forwards its ref to the underlying RN TextInput, so a parent can call
 * `.focus()`/`.blur()` imperatively (e.g. focusing the next field on
 * submit) — every variation forwards its own ref through to here too. A
 * press-mode field has no TextInput to forward to, so its ref stays `null`;
 * there's nothing to focus in a field that can't be typed into.
 */
const BaseInput = forwardRef<RNTextInputInstance, BaseInputProps>(
  function BaseInput(
    {
      value,
      onChangeText,
      label,
      placeholder,
      disabled,
      leftSlot,
      rightSlot,
      style,
      keyboardType = "default",
      secureTextEntry,
      autoCapitalize = "none",
      autoCorrect = false,
      error,
      helperText,
      onFocus,
      onBlur,
      onPress,
      expanded,
    },
    ref,
  ) {
    const theme = useTheme();
    const styles = useStyles();
    const [focused, setFocused] = useState(false);

    const helper = error ?? helperText;

    const fieldStyle = [
      styles.field,
      {
        backgroundColor: focused
          ? theme.colors.backgroundElementSelected
          : theme.colors.backgroundElement,
        opacity: disabled ? 0.5 : 1,
      },
      error ? { borderColor: theme.colors.error } : null,
    ];

    // A press-mode field renders its value as plain text rather than a
    // non-editable TextInput. Both look identical, but a TextInput announces
    // itself as an edit box and takes keyboard focus on web — wrong for a
    // control whose value can only be picked, not typed.
    const host: ReactNode = onPress ? (
      <Text
        value={value || placeholder || ""}
        type="callout"
        numberOfLines={1}
        style={[
          styles.text,
          { color: value ? theme.colors.text : theme.colors.textSecondary },
        ]}
      />
    ) : (
      <RNTextInput
        ref={ref}
        style={[styles.input, { color: theme.colors.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        editable={!disabled}
        // A sibling <Text> label isn't auto-associated with a field the
        // way HTML's <label for> is, and an error needs announcing as
        // *why* the field is invalid — both handled by the shared helper.
        {...fieldA11yProps({
          label: label ?? placeholder,
          disabled,
          error,
        })}
        onFocus={() => {
          setFocused(true);
          onFocus?.();
        }}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
      />
    );

    return (
      <View style={[styles.container, style]}>
        {label ? <Text value={label} type="footnote" /> : null}
        {onPress ? (
          <Pressable
            style={fieldStyle}
            onPress={onPress}
            disabled={disabled}
            // The whole row is one control, so the announcement is built
            // here rather than left to RN deriving it from the children —
            // which would read out the placeholder as if it were a value.
            {...controlA11yProps({
              label: label ?? placeholder,
              value: value || undefined,
              hint: error,
              disabled: disabled ?? false,
              expanded,
            })}
          >
            {leftSlot}
            {host}
            {rightSlot}
          </Pressable>
        ) : (
          <View style={fieldStyle}>
            {leftSlot}
            {host}
            {rightSlot}
          </View>
        )}
        {helper ? (
          <Text
            value={helper}
            type="caption1"
            style={{
              color: error ? theme.colors.error : theme.colors.textSecondary,
            }}
          />
        ) : null}
      </View>
    );
  },
);

// forwardRef components have no .name (unlike a plain function component) —
// set explicitly so `describe(\`${Component.displayName} smoke test\`, ...)`
// still works the same way it does for every non-forwardRef component here.
BaseInput.displayName = "BaseInput";

export default BaseInput;

// Label and helper text aren't styled here — they're <Text type="footnote">
// and <Text type="caption1">, so they get a *whole* type-scale entry rather
// than this file overriding only `fontSize` on top of `body`. That partial
// override was a real bug: an 11px label kept body's 19px line height.
const useStyles = createStyles(
  ({ isRTL, spacing, radius, sizes, typography }) => ({
    container: {
      gap: spacing.x8,
    },
    field: {
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      gap: spacing.x8,
      minHeight: sizes.elementHeightMd,
      borderRadius: radius.x8,
      paddingHorizontal: spacing.x12,
      borderWidth: spacing.x1,
      borderColor: "transparent",
    },
    // The RN TextInput host is not our Text component, so it takes the type
    // scale as a style rather than a `type` prop.
    input: {
      ...typography.callout,
      flex: 1,
      padding: 0,
      writingDirection: isRTL ? "rtl" : "ltr",
    },
    // The press-mode host *is* our Text component, so it only needs the
    // layout half of the above — `type="callout"` carries the type scale.
    text: {
      flex: 1,
      writingDirection: isRTL ? "rtl" : "ltr",
    },
  }),
);
