import { forwardRef, useState } from "react";
import {
  StyleSheet,
  TextInput as RNTextInput,
  View,
  type TextInput as RNTextInputInstance,
  type TextInputProps as RNTextInputProps,
} from "react-native";

import Text from "@/components/text";
import { createStyles } from "@/features/responsive";
import { useTheme } from "@/features/theme";

import type { CommonInputProps } from "../types";

export type BaseInputProps = CommonInputProps & {
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: RNTextInputProps["keyboardType"];
  secureTextEntry?: boolean;
};

/**
 * The shared shell every input variation (Text, Numeric, ...) renders
 * through — label, left/right slots, the actual RN TextInput host,
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
 * submit) — every variation forwards its own ref through to here too.
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
    },
    ref,
  ) {
    const theme = useTheme();
    const styles = useStyles();
    const [focused, setFocused] = useState(false);

    const helper = error ?? helperText;

    return (
      <View style={[styles.container, style]}>
        {label ? <Text value={label} style={styles.label} /> : null}
        <View
          style={[
            styles.field,
            {
              backgroundColor: focused
                ? theme.colors.backgroundElementSelected
                : theme.colors.backgroundElement,
              opacity: disabled ? 0.5 : 1,
            },
            error ? { borderColor: theme.colors.error } : null,
          ]}
        >
          {leftSlot}
          <RNTextInput
            ref={ref}
            style={[styles.input, { color: theme.colors.text }]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textSecondary}
            editable={!disabled}
            accessibilityLabel={label ?? placeholder}
            accessibilityState={{ disabled }}
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
          {rightSlot}
        </View>
        {helper ? (
          <Text
            value={helper}
            style={[
              styles.helperText,
              {
                color: error ? theme.colors.error : theme.colors.textSecondary,
              },
            ]}
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

const useStyles = createStyles(({ units }) =>
  StyleSheet.create({
    container: {
      gap: units(6),
    },
    label: {
      fontSize: units(13),
    },
    field: {
      flexDirection: "row",
      alignItems: "center",
      gap: units(8),
      minHeight: units(44),
      borderRadius: units(8),
      paddingHorizontal: units(12),
      borderWidth: units(1),
      borderColor: "transparent",
    },
    input: {
      flex: 1,
      fontSize: units(16),
      padding: 0,
    },
    helperText: {
      fontSize: units(12),
    },
  }),
);
