import type { ReactNode } from "react";
import type { StyleProp, TextInputProps, ViewStyle } from "react-native";

import type { FormFieldNecessity } from "@/components/form-field";

/** Props every input variation shares. */

/**
 * Shared across every input variation. Type-specific props (value/onChange's
 * exact shape, plus whatever extras that type needs) live in that type's own
 * props type below, and that type's UI/logic lives in its own folder
 * (./base, ./text, ./numeric, ...).
 */
export type CommonInputProps = {
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Off by default for every variation — override per field when wanted. */
  autoCapitalize?: TextInputProps["autoCapitalize"];
  /** Off by default for every variation — override per field when wanted. */
  autoCorrect?: boolean;
  /** Shown under the field and switches it to its invalid styling; takes priority over helperText. */
  error?: string;
  /** Shown under the field when there's no error. */
  helperText?: string;
  /**
   * Marks the field "Required" or "Optional" beside its label, and says so
   * to a screen reader as part of the field's name. Mark whichever is the
   * exception in the form — see `FormFieldNecessity`.
   */
  necessity?: FormFieldNecessity;
  onFocus?: () => void;
  onBlur?: () => void;
};
