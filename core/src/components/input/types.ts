import type { ReactNode } from "react";
import type { StyleProp, TextInputProps, ViewStyle } from "react-native";

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
  onFocus?: () => void;
  onBlur?: () => void;
};

export type TextInputTypeProps = {
  type?: "text";
  value: string;
  onChange: (value: string) => void;
};

export type NumericInputTypeProps = {
  type: "numeric";
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
};

export type EmailInputTypeProps = {
  type: "email";
  value: string;
  onChange: (value: string) => void;
};

export type PasswordInputTypeProps = {
  type: "password";
  value: string;
  onChange: (value: string) => void;
  /**
   * Marks this as the field a *new* password is being chosen in, rather than
   * an existing one being entered.
   *
   * It only changes what the OS and password managers are told
   * (`autoComplete`), but getting it wrong is the difference between being
   * offered the saved password and being offered a generated one. Defaults
   * to false — signing in is much the commoner case.
   */
  newPassword?: boolean;
};

/**
 * One choice in a `select`. `value` is what `onChange` reports and what
 * `value` is matched against; `label` is the only thing ever shown, so the
 * stored value can stay a stable code (`"uk"`) while the visible text is
 * free to be translated or reworded.
 */
export type SelectOption = {
  value: string;
  label: string;
};

export type SelectInputTypeProps = {
  type: "select";
  /** `null` when nothing is picked yet — the field then shows its placeholder. */
  value: string | null;
  /**
   * Only ever called with an option's `value`. It can't report `null`,
   * because picking an option is the only thing that fires it — a field
   * that should be clearable wants its own "None" option, whose `value` the
   * call site decides.
   */
  onChange: (value: string) => void;
  options: SelectOption[];
};

/**
 * Which parts of a moment a `datetime` field asks for. Defaults to
 * `"datetime"`; the other two hide the half they don't need.
 */
export type DateTimeMode = "date" | "time" | "datetime";

export type DateTimeInputTypeProps = {
  type: "datetime";
  /** `null` when nothing is picked yet — the field then shows its placeholder. */
  value: Date | null;
  /**
   * Fires once per confirmed pick, never mid-edit: the sheet stages taps in
   * a draft and only reports on "Done".
   */
  onChange: (value: Date) => void;
  mode?: DateTimeMode;
  /** Earliest selectable moment. Days, hours and minutes fully before it are disabled. */
  min?: Date;
  /** Latest selectable moment. Days, hours and minutes fully after it are disabled. */
  max?: Date;
};

export type InputProps = (
  | TextInputTypeProps
  | NumericInputTypeProps
  | EmailInputTypeProps
  | SelectInputTypeProps
  | DateTimeInputTypeProps
  | PasswordInputTypeProps
) &
  CommonInputProps;
