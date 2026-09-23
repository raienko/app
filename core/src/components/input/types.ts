import type { DocumentPickerAsset } from "expo-document-picker";
import type { CountryCode } from "libphonenumber-js";
import type { ReactNode } from "react";
import type { StyleProp, TextInputProps, ViewStyle } from "react-native";

import type { FormFieldNecessity } from "@/components/form-field";
import type { ComponentType } from "@/components/types";

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

export type TextInputTypeProps = {
  type?: "text";
  value: string;
  onChange: (value: string) => void;
};

export type TextAreaInputTypeProps = {
  type: "textarea";
  value: string;
  onChange: (value: string) => void;
  /**
   * A hard limit, and the moment a count appears under the field. Without
   * one there is nothing to count against, and a running total on its own
   * is a number nobody asked for.
   */
  maxLength?: number;
  /** How tall the field starts, in lines of text. Defaults to 3. */
  minLines?: number;
  /**
   * How tall it may grow as the text does before it scrolls instead.
   * Defaults to 6 — past that a growing field pushes the rest of the form
   * off screen, and whatever follows it (the submit button, usually) with it.
   */
  maxLines?: number;
  /**
   * The row is for one line of text; these have nowhere to go in a block of
   * several.
   */
  leftSlot?: never;
  rightSlot?: never;
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

export type CodeCharset = "numeric" | "alphanumeric";

export type CodeInputTypeProps = {
  type: "code";
  /**
   * What's been entered so far — shorter than `length` while it's being
   * filled. Only ever characters from `charset`: anything else the OS or a
   * paste supplies is dropped, the same way `numeric` strips as you type.
   */
  value: string;
  onChange: (value: string) => void;
  /** How many characters the code has. Defaults to 6. */
  length?: number;
  /**
   * Fires once the last character lands, with the finished code — the moment
   * a verification screen wants to submit, and the reason a caller doesn't
   * have to watch `value.length` themselves.
   */
  onComplete?: (value: string) => void;
  /**
   * What the code is made of. Defaults to `"numeric"`, which is what a
   * texted code almost always is and what gets the number pad;
   * `"alphanumeric"` takes letters too and asks for the normal keyboard.
   *
   * Either way anything outside the set is dropped, so a pasted code
   * arrives clean whatever the keyboard allowed.
   */
  charset?: CodeCharset;
  /**
   * The rest of `CommonInputProps` that this variation has no use for, made
   * unpassable rather than quietly ignored.
   *
   * There is nowhere to put a slot in a row of boxes, empty boxes already
   * are the placeholder, and capitalisation and correction follow from
   * `charset` rather than being the caller's to set.
   */
  placeholder?: never;
  leftSlot?: never;
  rightSlot?: never;
  autoCapitalize?: never;
  autoCorrect?: never;
};

export type PhoneInputTypeProps = {
  type: "phone";
  /**
   * The number in E.164 (`+12133734253`) once it's a valid one, and `null`
   * until then — so a caller can tell a finished number from a half-typed
   * one without parsing anything itself.
   */
  value: string | null;
  onChange: (value: string | null) => void;
  /**
   * Initial region for national input, as an ISO 3166-1 alpha-2 code. The
   * built-in picker and international-number detection own it after mount.
   * Without a default, the picker starts unselected and only international
   * input can be understood until the user chooses a country.
   */
  defaultCountry?: CountryCode;
  /** Fires for both an explicit picker choice and a detected international number. */
  onCountryChange?: (country: CountryCode) => void;
  /** Reserved for the built-in country calling-code picker. */
  leftSlot?: never;
};

export type PhoneCountryCode = CountryCode;

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

/** One independently selectable item in a `checklist`. */
export type ChecklistOption = {
  value: string;
  label: string;
  disabled?: boolean;
  testID?: string;
};

export type ChecklistInputTypeProps = {
  type: "checklist";
  /** The values of every currently checked option. */
  value: string[];
  /** Reports a new array whenever one option is checked or unchecked. */
  onChange: (value: string[]) => void;
  options: ChecklistOption[];
  /** Chooses the implementation used by every checkbox in the list. */
  checkboxType?: ComponentType;
  /** A checklist has no editable text surface for these common input props. */
  placeholder?: never;
  leftSlot?: never;
  rightSlot?: never;
  autoCapitalize?: never;
  autoCorrect?: never;
  onFocus?: never;
  onBlur?: never;
};

/** One independently controlled setting in a `switchGroup`. */
export type SwitchGroupOption = {
  value: string;
  label: string;
  disabled?: boolean;
  testID?: string;
};

type SwitchGroupControlProps =
  | {
      groupSwitch?: false;
      groupSwitchTestID?: never;
    }
  | {
      /** Makes the group's labelled header control every enabled option. */
      groupSwitch: true;
      /** Required because it is also the master switch's accessible name. */
      label: string;
      groupSwitchTestID?: string;
    };

export type SwitchGroupInputTypeProps = {
  type: "switchGroup";
  /** Values of every option currently switched on. */
  value: string[];
  onChange: (value: string[]) => void;
  options: SwitchGroupOption[];
  /** Chooses the implementation used by every switch, including groupSwitch. */
  switchType?: ComponentType;
  placeholder?: never;
  leftSlot?: never;
  rightSlot?: never;
  autoCapitalize?: never;
  autoCorrect?: never;
  onFocus?: never;
  onBlur?: never;
} & SwitchGroupControlProps;

/** One mutually exclusive choice in a `radioGroup`. */
export type RadioGroupOption = {
  value: string;
  label: string;
  disabled?: boolean;
  testID?: string;
};

export type RadioGroupInputTypeProps = {
  type: "radioGroup";
  /** `null` means no option is currently selected. */
  value: string | null;
  /** Reports the newly selected option's value. */
  onChange: (value: string) => void;
  options: RadioGroupOption[];
  /** Chooses the radio implementation used by every option. */
  radioType?: ComponentType;
  placeholder?: never;
  leftSlot?: never;
  rightSlot?: never;
  autoCapitalize?: never;
  autoCorrect?: never;
  onFocus?: never;
  onBlur?: never;
};

type RangeInputSharedProps = {
  type: "range";
  min?: number;
  max?: number;
  step?: number;
  /** Chooses Expo UI for one thumb; multi-thumb values use the custom slider. */
  sliderType?: ComponentType;
  thumbLabels?: string[];
  formatValue?: (value: number, index: number) => string;
  /** Required because every adjustable thumb needs an accessible name. */
  label: string;
  placeholder?: never;
  leftSlot?: never;
  rightSlot?: never;
  autoCapitalize?: never;
  autoCorrect?: never;
};

export type RangeInputTypeProps = RangeInputSharedProps &
  (
    | {
        value: number;
        onChange: (value: number) => void;
      }
    | {
        value: number[];
        onChange: (value: number[]) => void;
      }
  );

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

/** What `expo-document-picker` reports back, re-exported for call sites. */
export type FileInputAsset = DocumentPickerAsset;

export type FileInputTypeProps = {
  type: "file";
  /** `null` until a file is chosen — the field then shows its placeholder. */
  value: FileInputAsset | null;
  /**
   * Only ever called with a chosen file. It can't report `null`, because
   * picking is the only thing that fires it — a field that should be
   * clearable wants its own clear control beside it, the same shape
   * `select` has.
   */
  onChange: (value: FileInputAsset) => void;
  /**
   * Passed through to the picker: `type` for the MIME types on offer,
   * `copyToCacheDirectory` for whether the file is copied somewhere the
   * rest of Expo can read straight away.
   */
  options?: {
    type?: string | string[];
    copyToCacheDirectory?: boolean;
  };
};

export type InputProps = (
  | TextInputTypeProps
  | TextAreaInputTypeProps
  | NumericInputTypeProps
  | EmailInputTypeProps
  | SelectInputTypeProps
  | ChecklistInputTypeProps
  | SwitchGroupInputTypeProps
  | RadioGroupInputTypeProps
  | RangeInputTypeProps
  | DateTimeInputTypeProps
  | PasswordInputTypeProps
  | CodeInputTypeProps
  | PhoneInputTypeProps
  | FileInputTypeProps
) &
  CommonInputProps;
